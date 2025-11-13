const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  let token = localStorage.getItem('access_token');
  if (!token) {
    try {
      const stored = localStorage.getItem('authTokens');
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed?.access || null;
      }
    } catch (e) {
      // ignore parse errors
    }
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    let data: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try { data = await response.json(); } catch (_) {}
    } else {
      try { data = await response.text(); } catch (_) {}
    }
    if (!response.ok) {
      const err: any = new Error(`HTTP ${response.status}`);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  },

  register: async (userData: any) => {
    return await apiCall('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await apiCall('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getProfile: async () => {
    return await apiCall('/auth/profile/');
  }
};

// Hospital API calls
export const hospitalAPI = {
  getHospitals: async () => {
    return await apiCall('/hospitals/');
  }
};

// Patient API calls
export const patientAPI = {
  getPatients: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiCall(`/patients/${queryString}`);
  },

  getPatient: async (id: number) => {
    return await apiCall(`/patients/${id}/`);
  },

  createPatient: async (patientData: any) => {
    return await apiCall('/patients/', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },

  updatePatient: async (id: number, patientData: any) => {
    return await apiCall(`/patients/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(patientData)
    });
  },

  deletePatient: async (id: number) => {
    return await apiCall(`/patients/${id}/`, {
      method: 'DELETE'
    });
  },

  searchPatients: async (query: string) => {
    return await apiCall(`/patients/search/?search=${encodeURIComponent(query)}`);
  },

  getPatientStats: async () => {
    return await apiCall('/patients/stats/');
  }
};

// Doctor API calls
export const doctorAPI = {
  getDoctors: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiCall(`/doctors/${queryString}`);
  },

  getDoctor: async (id: number) => {
    return await apiCall(`/doctors/${id}/`);
  },

  createDoctor: async (doctorData: any) => {
    return await apiCall('/doctors/', {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
  },

  updateDoctor: async (id: number, doctorData: any, partial: boolean = true) => {
    return await apiCall(`/doctors/${id}/`, {
      method: partial ? 'PATCH' : 'PUT',
      body: JSON.stringify(doctorData)
    });
  },

  deleteDoctor: async (id: number) => {
    return await apiCall(`/doctors/${id}/`, {
      method: 'DELETE'
    });
  },

  searchDoctors: async (query: string) => {
    return await apiCall(`/doctors/search/?search=${encodeURIComponent(query)}`);
  },

  getDoctorStats: async () => {
    return await apiCall('/doctors/stats/');
  }
};

// Appointment API calls
export const appointmentAPI = {
  getAppointments: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiCall(`/appointments/${queryString}`);
  },

  getAppointment: async (id: number) => {
    return await apiCall(`/appointments/${id}/`);
  },

  createAppointment: async (appointmentData: any) => {
    return await apiCall('/appointments/', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  },

  updateAppointment: async (id: number, appointmentData: any) => {
    return await apiCall(`/appointments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    });
  },

  deleteAppointment: async (id: number) => {
    return await apiCall(`/appointments/${id}/`, {
      method: 'DELETE'
    });
  },

  searchAppointments: async (query: string) => {
    return await apiCall(`/appointments/search/?search=${encodeURIComponent(query)}`);
  },

  getAppointmentStats: async () => {
    return await apiCall('/appointments/stats/');
  },

  getTodayAppointments: async () => {
    return await apiCall('/appointments/today/');
  },

  getUpcomingAppointments: async () => {
    return await apiCall('/appointments/upcoming/');
  }
};

// Staff API calls
export const staffAPI = {
  getStaff: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiCall(`/staff/${queryString}`);
  },

  getStaffById: async (id: number) => {
    return await apiCall(`/staff/${id}/`);
  },

  createStaff: async (staffData: any) => {
    return await apiCall('/staff/', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
  },

  updateStaff: async (id: number, staffData: any) => {
    return await apiCall(`/staff/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(staffData)
    });
  },

  deleteStaff: async (id: number) => {
    return await apiCall(`/staff/${id}/`, {
      method: 'DELETE'
    });
  },

  searchStaff: async (query: string) => {
    return await apiCall(`/staff/?search=${encodeURIComponent(query)}`);
  },

  getStaffStats: async () => {
    return await apiCall('/staff/stats/');
  }
};

// Beds API calls
export const bedAPI = {
  getBeds: async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await apiCall(`/beds/${queryString}`);
  },

  getBed: async (id: number) => {
    return await apiCall(`/beds/${id}/`);
  },

  createBed: async (bedData: any) => {
    return await apiCall('/beds/', {
      method: 'POST',
      body: JSON.stringify(bedData)
    });
  },

  updateBed: async (id: number, bedData: any) => {
    return await apiCall(`/beds/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(bedData)
    });
  },

  deleteBed: async (id: number) => {
    return await apiCall(`/beds/${id}/`, {
      method: 'DELETE'
    });
  },

  getBedStats: async () => {
    return await apiCall('/beds/stats/');
  }
};

// Reports API calls (placeholder - backend not implemented yet)
export const reportsAPI = {
  getPatientReports: async (params?: any) => {
    // Placeholder - implement when backend is ready
    console.log('Patient reports API called with params:', params);
    return { message: 'Patient reports endpoint not implemented yet' };
  },

  getAppointmentReports: async (params?: any) => {
    // Placeholder - implement when backend is ready
    console.log('Appointment reports API called with params:', params);
    return { message: 'Appointment reports endpoint not implemented yet' };
  },

  getStaffReports: async (params?: any) => {
    // Placeholder - implement when backend is ready
    console.log('Staff reports API called with params:', params);
    return { message: 'Staff reports endpoint not implemented yet' };
  },

  generateReport: async (reportType: string, filters?: any) => {
    // Placeholder - implement when backend is ready
    console.log('Generate report API called with type:', reportType, 'filters:', filters);
    return { message: `Report generation for ${reportType} not implemented yet` };
  }
};

export default {
  auth: authAPI,
  hospital: hospitalAPI,
  patient: patientAPI,
  doctor: doctorAPI,
  appointment: appointmentAPI
};
