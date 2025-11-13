import React, { useState } from 'react';
import { reportsAPI } from '../services/api';
import './ReportGeneration.css';
interface ReportFilters {
  startDate: string;
  endDate: string;
  department?: string;
  reportType: string;
}

const ReportGeneration: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    department: '',
    reportType: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      let reportData;
      switch (filters.reportType) {
        case 'patient':
          reportData = await reportsAPI.getPatientReports(filters);
          break;
        case 'appointment':
          reportData = await reportsAPI.getAppointmentReports(filters);
          break;
        case 'staff':
          reportData = await reportsAPI.getStaffReports(filters);
          break;
        default:
          reportData = await reportsAPI.generateReport(filters.reportType, filters);
      }

      setSuccess('Report generated successfully! (This is a placeholder - backend implementation needed)');
      console.log('Report data:', reportData);
    } catch (err: any) {
      setError('Failed to generate report: ' + (err?.message || 'Unknown error'));
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-section">
      <div className="section-header">
        <h2>Report Generation</h2>
        <p>Generate various reports for hospital management</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="report-filters">
        <div className="filter-group">
          <label>Report Type</label>
          <select
            name="reportType"
            value={filters.reportType}
            onChange={handleInputChange}
          >
            <option value="patient">Patient Reports</option>
            <option value="appointment">Appointment Reports</option>
            <option value="staff">Staff Reports</option>
            <option value="financial">Financial Reports</option>
            <option value="inventory">Inventory Reports</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="filter-group">
          <label>Department (Optional)</label>
          <select
            name="department"
            value={filters.department}
            onChange={handleInputChange}
          >
            <option value="">All Departments</option>
            <option value="emergency">Emergency</option>
            <option value="cardiology">Cardiology</option>
            <option value="neurology">Neurology</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="surgery">Surgery</option>
            <option value="radiology">Radiology</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="administration">Administration</option>
          </select>
        </div>

        <div className="filter-actions">
          <button
            className="btn-primary"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="report-types">
        <h3>Available Report Types</h3>
        <div className="report-grid">
          <div className="report-card">
            <h4>Patient Reports</h4>
            <p>Patient registration, demographics, and medical history reports</p>
            <ul>
              <li>Patient Registration Summary</li>
              <li>Demographics Report</li>
              <li>Medical History Analysis</li>
            </ul>
          </div>

          <div className="report-card">
            <h4>Appointment Reports</h4>
            <p>Appointment scheduling, attendance, and department-wise statistics</p>
            <ul>
              <li>Appointment Summary</li>
              <li>Department-wise Appointments</li>
              <li>Attendance Reports</li>
            </ul>
          </div>

          <div className="report-card">
            <h4>Staff Reports</h4>
            <p>Staff management, attendance, and performance reports</p>
            <ul>
              <li>Staff Directory</li>
              <li>Department-wise Staff</li>
              <li>Attendance Reports</li>
            </ul>
          </div>

          <div className="report-card">
            <h4>Financial Reports</h4>
            <p>Revenue, expenses, and financial performance reports</p>
            <ul>
              <li>Revenue Reports</li>
              <li>Expense Analysis</li>
              <li>Profit & Loss</li>
            </ul>
          </div>

          <div className="report-card">
            <h4>Inventory Reports</h4>
            <p>Medical supplies, equipment, and inventory management</p>
            <ul>
              <li>Stock Levels</li>
              <li>Usage Reports</li>
              <li>Reorder Alerts</li>
            </ul>
          </div>

          <div className="report-card">
            <h4>Custom Reports</h4>
            <p>Create custom reports based on specific requirements</p>
            <ul>
              <li>Ad-hoc Queries</li>
              <li>Custom Filters</li>
              <li>Export Options</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="report-note">
        <p><strong>Note:</strong> This is a placeholder component. The actual report generation functionality
        requires backend implementation with proper data aggregation and export capabilities.</p>
      </div>
    </div>
  );
};

export default ReportGeneration;
