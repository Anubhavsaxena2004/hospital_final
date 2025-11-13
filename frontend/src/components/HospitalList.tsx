// src/components/HospitalList.tsx
import React from 'react';
import { Hospital } from '../models/Hospital';
import './HospitalList.css';

interface HospitalListProps {
  hospitals: Hospital[];
  onEdit: (hospital: Hospital) => void;
  onDelete: (id: string) => void;
}

const HospitalList: React.FC<HospitalListProps> = ({ hospitals, onEdit, onDelete }) => {
  return (
    <div className="hospital-list">
      {hospitals.length === 0 ? (
        <p>No hospitals found. Add a new hospital to get started.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Beds (Available/Total)</th>
              <th>Doctors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map(hospital => (
              <tr key={hospital.id}>
                <td data-label="Name">{hospital.name}</td>
                <td data-label="Address">{hospital.address}</td>
                <td data-label="Contact">{hospital.contactNumber}</td>
                <td data-label="Beds">
                  <span className="beds-available">{hospital.availableBeds}</span>
                  <span> / </span>
                  <span className="beds-total">{hospital.totalBeds}</span>
                </td>
                <td data-label="Doctors">{hospital.totalDoctors}</td>
                <td data-label="Actions">
                  <button 
                    onClick={() => onEdit(hospital)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(hospital.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HospitalList;