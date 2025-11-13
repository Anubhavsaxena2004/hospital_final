// src/components/RegisterForm.tsx
import React, { useState } from 'react';
import './RegistrationForm.css';


interface Props {
  onFlip: () => void;
}

const RegisterForm: React.FC<Props> = ({ onFlip }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [hospitalId, setHospitalId] = useState<number | ''>('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== password2) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          password2,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          hospital_id: hospitalId ,
          role,
        }),
      });

      if (response.status === 201) {
        alert("Registration successful! Please login.");
        onFlip();
      } else {
        const data = await response.json();
        alert(`Registration failed: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert('An error occurred during registration.');
    }
  };

  return (
    <div className="form-container" style={{ marginTop: '0px' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* First Name */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        {/* Last Name */}
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        {/* Phone */}
        
        {/* Hospital ID */}
        <input
  type="number"
  placeholder="Hospital ID"
  value={hospitalId}
  onChange={(e) => setHospitalId(Number(e.target.value))}
  required
/>


        {/* Role Dropdown */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '8px',
            marginBottom: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        >
          <option value="">Select Role</option>
  <option value="admin">Hospital Admin</option>
  <option value="doctor">Doctor</option>
  <option value="nurse">Nurse</option>
  <option value="receptionist">Receptionist</option>
  <option value="staff">General Staff</option>
        </select>
{/* admin', 'Hospital Admin'),
            ('doctor', 'Doctor'),
            ('nurse', 'Nurse'),
            ('receptionist', 'Receptionist'),
            ('staff', 'General Staff'), */}


       <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <button type="submit" style={{ marginTop: '12px' }}>Register</button>
      </form>
      <p>
        Already have an account?{' '}
        <span onClick={onFlip} style={{ cursor: 'pointer', color: 'blue' }}>
          Login
        </span>
      </p>
    </div>
  );
};

export default RegisterForm;
