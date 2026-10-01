import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Calendar, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-toastify';

export const AdminReportsPage = () => {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReports(reportType, startDate, endDate);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report:', err);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportCSV = () => {
    if (!reportData || !reportData.records || reportData.records.length === 0) {
      toast.info('No records to export');
      return;
    }

    const records = reportData.records;
    const headers = Object.keys(records[0]);
    const csvRows = [];

    // Header row
    csvRows.push(headers.join(','));

    // Data rows
    records.forEach((row) => {
      const values = headers.map((header) => {
        const escaped = ('' + (row[header] ?? '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ShopSphere_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Business Reports & Analytics</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Export operational records, revenue ledgers, and merchandise inventory statistics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrint} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', minWidth: '180px' }}
            >
              <option value="sales">Sales & Revenue</option>
              <option value="products">Product & Stock</option>
              <option value="orders">Orders & Fulfillment</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <button
              onClick={fetchReport}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Run Filter
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Generating {reportType} report...</div>
      ) : reportData ? (
        <div>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {Object.entries(reportData.summary || {}).map(([key, val]) => (
              <div key={key} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                  {key.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                  {key.includes('revenue') || key.includes('amount') ? `₹${Number(val).toLocaleString('en-IN')}` : val}
                </div>
              </div>
            ))}
          </div>

          {/* Records Table */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {reportData.records && reportData.records.length > 0 ? (
                    Object.keys(reportData.records[0]).map((col) => (
                      <th key={col} style={{ textTransform: 'capitalize' }}>
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))
                  ) : (
                    <th>No Data</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportData.records && reportData.records.length > 0 ? (
                  reportData.records.map((row, idx) => (
                    <tr key={idx}>
                      {Object.entries(row).map(([k, v], cellIdx) => (
                        <td key={cellIdx}>
                          {k.includes('amount') || k === 'price' ? `₹${Number(v).toLocaleString('en-IN')}` : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '3rem' }}>
                      No records match the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};
