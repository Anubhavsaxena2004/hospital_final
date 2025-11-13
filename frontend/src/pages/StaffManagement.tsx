import React, { useState, useEffect } from 'react';
import { staffAPI } from '../services/api';

// Define TypeScript interfaces
interface Staff {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hire_date: string;
  salary: number | null;
  is_active: boolean;
  full_name: string;
}

interface StaffStats {
  total_staff: number;
  active_staff: number;
  // Add other properties as needed
}

interface NewStaff {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hire_date: string;
  salary: string;
  address: string;
  qualifications: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activeRoleTab, setActiveRoleTab] = useState<string>('all');
  const [staffStats, setStaffStats] = useState<StaffStats | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState<NewStaff>({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    hire_date: '',
    salary: '',
    address: '',
    qualifications: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch staff data from API
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffAPI.getStaff();
      if (Array.isArray(data)) {
        setStaff(data);
      } else if (data && Array.isArray(data.results)) {
        setStaff(data.results);
      } else {
        setStaff([]);
      }
    } catch (err) {
      setError('Failed to fetch staff');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff statistics
  const fetchStaffStats = async () => {
    try {
      const data = await staffAPI.getStaffStats();
      setStaffStats(data);
    } catch (err) {
      console.error('Error fetching staff stats:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewStaff({
      ...newStaff,
      [name]: value
    });
  };

  // Submit new staff form
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const staffData = {
        ...newStaff,
        salary: newStaff.salary ? parseFloat(newStaff.salary) : null
      };
      const created = await staffAPI.createStaff(staffData);
      setShowAddStaffModal(false);
      setSuccess(created?.id ? `Staff #${created.id} added successfully.` : 'Staff added successfully.');
      setError('');
      setNewStaff({
        employee_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        hire_date: '',
        salary: '',
        address: '',
        qualifications: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      });
      fetchStaff(); // Refresh the staff list
      fetchStaffStats(); // Refresh stats
    } catch (err: any) {
      let message = 'Failed to add staff';
      const status = err?.status;
      const data = err?.data;
      if (status === 401) {
        message = 'Unauthorized. Please log in again.';
      } else if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else if (typeof data === 'object') {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const key = keys[0];
            const val = Array.isArray((data as any)[key]) ? (data as any)[key][0] : (data as any)[key];
            message = `${key}: ${val}`;
          }
        }
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
      console.error('Error adding staff:', data || err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchStaff();
    fetchStaffStats();
  }, []);

  return (
    <div className="patients-section">
      <div className="section-header">
        <h2>Staff Management</h2>
        <button
          className="btn-primary"
          onClick={() => setShowAddStaffModal(true)}
        >
          Add New Staff
        </button>
      </div>

      {/* Role Tabs */}
      <div className="dashboard-tabs" style={{ marginBottom: '12px' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'admin', label: 'Administrators' },
          { key: 'doctor', label: 'Doctors' },
          { key: 'nurse', label: 'Nurses' },
          { key: 'receptionist', label: 'Receptionists' },
          { key: 'pharmacist', label: 'Pharmacists' },
          { key: 'technician', label: 'Technicians' },
          { key: 'manager', label: 'Managers' },
          { key: 'other', label: 'Other' },
        ].map(tab => (
          <button
            key={tab.key}
            className={activeRoleTab === tab.key ? 'tab active' : 'tab'}
            onClick={() => setActiveRoleTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtered view info */}
      {activeRoleTab !== 'all' && (
        <div className="info" style={{ marginBottom: '8px' }}>
          Showing role: <strong>{activeRoleTab}</strong>
        </div>
      )}

      {loading && <div className="loading">Loading staff...</div>}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="patients-table">
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff
              .filter(m => activeRoleTab === 'all' ? true : m.role === activeRoleTab)
              .map(member => (
              <tr key={member.id}>
                <td>{member.employee_id}</td>
                <td>{member.full_name}</td>
                <td>{member.role}</td>
                <td>{member.department}</td>
                <td>{member.email}</td>
                <td>{member.phone}</td>
                <td>
                  <span className={`status ${member.is_active ? 'active' : 'inactive'}`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn-sm">View</button>
                  <button className="btn-sm">Edit</button>
                </td>
              </tr>
            ))}
            {(!loading && staff.filter(m => activeRoleTab === 'all' ? true : m.role === activeRoleTab).length === 0) && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '16px' }}>
                  No staff found for this role.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Staff Member</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddStaffModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="staff-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    name="employee_id"
                    value={newStaff.employee_id}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={newStaff.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={newStaff.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={newStaff.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newStaff.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={newStaff.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="admin">Administrator</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="technician">Technician</option>
                    <option value="manager">Manager</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={newStaff.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="emergency">Emergency</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="surgery">Surgery</option>
                    <option value="radiology">Radiology</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="administration">Administration</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Hire Date *</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={newStaff.hire_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={newStaff.salary}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={newStaff.address}
                  onChange={handleInputChange}
                  rows={3}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Qualifications</label>
                <textarea
                  name="qualifications"
                  value={newStaff.qualifications}
                  onChange={handleInputChange}
                  rows={3}
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={newStaff.emergency_contact_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={newStaff.emergency_contact_phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddStaffModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
