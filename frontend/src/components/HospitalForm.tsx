// src/components/HospitalForm.tsx
import React, { useState, useEffect } from 'react';
import { Hospital } from '../models/Hospital';
import './HospitalForm.css';

interface HospitalFormProps {
  onSubmit: (hospital: Hospital) => void;
  hospital: Hospital | null;
  isEditing: boolean;
}

const HospitalForm: React.FC<HospitalFormProps> = ({ onSubmit, hospital, isEditing }) => {
  const [formData, setFormData] = useState<Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    address: '',
    contactNumber: '',
    email: '',
    totalBeds: 0,
    availableBeds: 0,
    totalDoctors: 0,
    specialties: [],
    facilities: []
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newFacility, setNewFacility] = useState('');

  useEffect(() => {
    if (hospital) {
      const { id, createdAt, updatedAt, ...rest } = hospital;
      setFormData(rest);
    } else {
      setFormData({
        name: '',
        address: '',
        contactNumber: '',
        email: '',
        totalBeds: 0,
        availableBeds: 0,
        totalDoctors: 0,
        specialties: [],
        facilities: []
      });
    }
  }, [hospital]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'totalBeds' || name === 'availableBeds' || name === 'totalDoctors' 
        ? parseInt(value) || 0 
        : value
    });
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    });
  };

  const handleAddFacility = () => {
    if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, newFacility.trim()]
      });
      setNewFacility('');
    }
  };

  const handleRemoveFacility = (facility: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter(f => f !== facility)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: hospital?.id || '',
      createdAt: hospital?.createdAt || new Date(),
      updatedAt: new Date()
    } as Hospital);
  };

  return (
    <form onSubmit={handleSubmit} className="hospital-form">
      <div className="form-group">
        <label>Hospital Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Contact Number:</label>
        <input
          type="tel"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Total Beds:</label>
          <input
            type="number"
            name="totalBeds"
            value={formData.totalBeds}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Available Beds:</label>
          <input
            type="number"
            name="availableBeds"
            value={formData.availableBeds}
            onChange={handleChange}
            min="0"
            max={formData.totalBeds}
            required
          />
        </div>

        <div className="form-group">
          <label>Total Doctors:</label>
          <input
            type="number"
            name="totalDoctors"
            value={formData.totalDoctors}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Specialties:</label>
        <div className="tag-input">
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Add specialty"
          />
          <button type="button" onClick={handleAddSpecialty}>Add</button>
        </div>
        <div className="tags">
          {formData.specialties.map(specialty => (
            <span key={specialty} className="tag">
              {specialty}
              <button type="button" onClick={() => handleRemoveSpecialty(specialty)}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Facilities:</label>
        <div className="tag-input">
          <input
            type="text"
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            placeholder="Add facility"
          />
          <button type="button" onClick={handleAddFacility}>Add</button>
        </div>
        <div className="tags">
          {formData.facilities.map(facility => (
            <span key={facility} className="tag">
              {facility}
              <button type="button" onClick={() => handleRemoveFacility(facility)}>×</button>
            </span>
          ))}
        </div>
      </div>

      <button type="submit" className="submit-button">
        {isEditing ? 'Update Hospital' : 'Add Hospital'}
      </button>
    </form>
  );
};

export default HospitalForm;