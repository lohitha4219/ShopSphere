import os
import requests
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

def verify_google_id_token(token):
    """
    Verifies a Google ID token using google-auth library and fallback to Google tokeninfo API.
    Returns payload dictionary containing: email, name, given_name, family_name, picture, sub.
    Raises ValueError on verification failure.
    """
    if not token or not isinstance(token, str):
        raise ValueError('Invalid token provided')

    client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '') or os.getenv('GOOGLE_CLIENT_ID', '')
    client_id = client_id.strip() if client_id else ''

    # 1. Try cryptographic verification via google-auth
    try:
        request = google_requests.Request()
        audience = client_id if client_id else None
        payload = id_token.verify_oauth2_token(token, request, audience=audience)

        if payload.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid token issuer')

        if not payload.get('email'):
            raise ValueError('Email not provided by Google')

        if not payload.get('email_verified', False):
            raise ValueError('Google email is not verified')

        return payload
    except Exception as e:
        # 2. Fallback to Google's official tokeninfo endpoint
        try:
            resp = requests.get(
                'https://oauth2.googleapis.com/tokeninfo',
                params={'id_token': token},
                timeout=10
            )
            if resp.status_code == 200:
                payload = resp.json()
                if payload.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
                    raise ValueError('Invalid token issuer')
                if client_id and payload.get('aud') != client_id:
                    raise ValueError('Token audience mismatch')
                if not payload.get('email') or payload.get('email_verified') not in [True, 'true', 1]:
                    raise ValueError('Google email not verified')
                return payload
        except Exception:
            pass

        raise ValueError('Unable to verify your Google account. Please try again.')
