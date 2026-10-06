import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "shopsphere-super-secret-dev-key-change-in-production-2026"
)

DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")


# ============================================================
# ALLOWED HOSTS
# ============================================================

allowed_hosts_env = os.getenv("ALLOWED_HOSTS")

if allowed_hosts_env:
    ALLOWED_HOSTS = [
        host.strip()
        for host in allowed_hosts_env.split(",")
        if host.strip()
    ]

    if "testserver" not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append("testserver")

else:
    ALLOWED_HOSTS = [
        "localhost",
        "127.0.0.1",
        "testserver",
        ".railway.app",
        ".up.railway.app",
        ".onrender.com",
        "*",
    ]


# ============================================================
# APPLICATIONS
# ============================================================

INSTALLED_APPS = [

    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "drf_spectacular",

    # ShopSphere
    "apps.accounts",
    "apps.categories",
    "apps.products",
    "apps.cart",
    "apps.orders",
    "apps.payments",
    "apps.reviews",
    "apps.wishlist",
    "apps.sellers",
    "apps.coupons",
    "apps.notifications",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [

    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL / WSGI
# ============================================================

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [

    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [
            BASE_DIR / "templates"
        ],

        "APP_DIRS": True,

        "OPTIONS": {

            "context_processors": [

                "django.template.context_processors.debug",

                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",

            ],
        },
    },
]


# ============================================================
# DATABASE
# ============================================================
#
# Render
#    ↓
# Railway MySQL
#
# Railway MySQL TCP Proxy:
# Host = shuttle.proxy.rlwy.net
# Port = 40267
#
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL")


if DATABASE_URL:

    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

else:

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",

            "NAME": os.getenv(
                "DB_NAME",
                "railway"
            ),

            "USER": os.getenv(
                "DB_USER",
                "root"
            ),

            "PASSWORD": os.getenv(
                "DB_PASSWORD",
                ""
            ),

            "HOST": os.getenv(
                "DB_HOST",
                "localhost"
            ),

            "PORT": os.getenv(
                "DB_PORT",
                "3306"
            ),

            "OPTIONS": {
                "charset": "utf8mb4",
            },

            "CONN_MAX_AGE": 600,

            "CONN_HEALTH_CHECKS": True,
        }
    }


# ============================================================
# CUSTOM USER MODEL
# ============================================================

AUTH_USER_MODEL = "accounts.User"


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [

    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),

        "OPTIONS": {
            "min_length": 6
        },
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = (
    "whitenoise.storage.CompressedStaticFilesStorage"
)


# ============================================================
# MEDIA FILES
# ============================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {

    "DEFAULT_AUTHENTICATION_CLASSES": (

        "rest_framework_simplejwt.authentication."
        "JWTAuthentication",

    ),

    "DEFAULT_PERMISSION_CLASSES": [

        "rest_framework.permissions.AllowAny",

    ],

    "DEFAULT_FILTER_BACKENDS": [

        "django_filters.rest_framework.DjangoFilterBackend",

        "rest_framework.filters.SearchFilter",

        "rest_framework.filters.OrderingFilter",

    ],

    "DEFAULT_PAGINATION_CLASS": (
        "rest_framework.pagination.PageNumberPagination"
    ),

    "PAGE_SIZE": 20,

    "DEFAULT_SCHEMA_CLASS": (
        "drf_spectacular.openapi.AutoSchema"
    ),
}


# ============================================================
# SIMPLE JWT
# ============================================================

SIMPLE_JWT = {

    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),

    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    "ROTATE_REFRESH_TOKENS": True,

    "BLACKLIST_AFTER_ROTATION": False,

    "AUTH_HEADER_TYPES": (
        "Bearer",
    ),

    "USER_ID_FIELD": "id",

    "USER_ID_CLAIM": "user_id",
}


# ============================================================
# CORS
# ============================================================

CORS_ALLOW_ALL_ORIGINS = (
    os.getenv(
        "CORS_ALLOW_ALL_ORIGINS",
        "True"
    ).lower()
    in ("true", "1", "yes")
)

CORS_ALLOW_CREDENTIALS = True


cors_origins_env = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    ""
)


if cors_origins_env:

    CORS_ALLOWED_ORIGINS = [

        origin.strip()

        for origin in cors_origins_env.split(",")

        if origin.strip()

    ]

else:

    CORS_ALLOWED_ORIGINS = [

        "http://localhost:5173",

        "http://127.0.0.1:5173",

        "http://localhost:3000",

    ]


# ============================================================
# CSRF
# ============================================================

csrf_origins_env = os.getenv(
    "CSRF_TRUSTED_ORIGINS",
    ""
)


if csrf_origins_env:

    CSRF_TRUSTED_ORIGINS = [

        origin.strip()

        for origin in csrf_origins_env.split(",")

        if origin.strip()

    ]

else:

    CSRF_TRUSTED_ORIGINS = [

        "http://localhost:5173",

        "http://127.0.0.1:5173",

        "http://localhost:3000",

        "https://*.railway.app",

        "https://*.up.railway.app",

        "https://*.onrender.com",

        "https://*.vercel.app",

    ]


# ============================================================
# HTTPS / REVERSE PROXY
# ============================================================

SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)


# ============================================================
# DRF SPECTACULAR
# ============================================================

SPECTACULAR_SETTINGS = {

    "TITLE": "ShopSphere E-Commerce API",

    "DESCRIPTION": (
        "Complete REST API for ShopSphere "
        "E-Commerce Platform"
    ),

    "VERSION": "1.0.0",

    "SERVE_INCLUDE_SCHEMA": False,
}


# ============================================================
# RAZORPAY
# ============================================================

RAZORPAY_KEY_ID = os.getenv(
    "RAZORPAY_KEY_ID",
    ""
)

RAZORPAY_KEY_SECRET = os.getenv(
    "RAZORPAY_KEY_SECRET",
    ""
)


# ============================================================
# GOOGLE OAUTH
# ============================================================

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    ""
)

GOOGLE_CLIENT_SECRET = os.getenv(
    "GOOGLE_CLIENT_SECRET",
    ""
)