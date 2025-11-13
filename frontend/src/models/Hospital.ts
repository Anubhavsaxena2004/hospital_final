// src/models/Hospital.ts
export interface Hospital {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  totalBeds: number;
  availableBeds: number;
  totalDoctors: number;
  specialties: string[];
  facilities: string[];
  createdAt: Date;
  updatedAt: Date;
}