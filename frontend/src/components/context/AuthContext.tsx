// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface AuthToken {
  user_id: number;
  exp: number;
}

interface AuthContextType {
  user: AuthToken | null;
  authTokens: { access: string; refresh: string } | null;
  loginUser: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  logoutUser: () => void;
}

// Provide default values instead of undefined
const defaultAuthContext: AuthContextType = {
  user: null,
  authTokens: null,
  loginUser: async () => {},
  logoutUser: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export default AuthContext;

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authTokens, setAuthTokens] = useState<{ access: string; refresh: string } | null>(() => {
    try {
      const stored = localStorage.getItem('authTokens');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored auth tokens:', error);
      return null;
    }
  });

  const [user, setUser] = useState<AuthToken | null>(() => {
    try {
      if (authTokens) {
        return jwtDecode(authTokens.access);
      }
      return null;
    } catch (error) {
      console.error('Error decoding auth token:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // -------------------- LOGIN FUNCTION --------------------
  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      username: { value: string };
      password: { value: string };
      hospital_id: { value: string };
    };

    try {
    const response = await fetch("http://localhost:8000/api/auth/login/".trim(), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: target.username.value,
    password: target.password.value,
    hospital_id: target.hospital_id.value,
  }),
});


      const data = await response.json();

      if (response.status === 200) {
        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        localStorage.setItem('authTokens', JSON.stringify(data));
        navigate('/'); // Redirect to home page after login
      } else {
        alert(data.detail || 'Something went wrong!');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  // -------------------- LOGOUT FUNCTION --------------------
  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate('/register'); // Redirect to register page after logout
  };

  const contextData: AuthContextType = {
    user,
    authTokens,
    loginUser,
    logoutUser,
  };

  useEffect(() => {
    if (authTokens) {
      try {
        setUser(jwtDecode(authTokens.access));
      } catch (error) {
        console.error('Error decoding stored token:', error);
        setUser(null);
      }
    }
    setLoading(false);
  }, [authTokens]);

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
