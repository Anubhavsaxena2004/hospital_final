// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface AuthToken {
  user_id?: number;
  exp?: number;
  role?: string;
  hospital_id?: number | null;
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
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      if (authTokens) {
        return jwtDecode(authTokens.access);
      }
      return null;
    } catch (error) {
      console.error('Error loading user info:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      username: { value: string };
      password: { value: string };
      hospital_id: { value: string };
    };

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        // Prefer server-provided user context (includes role and hospital)
        const userInfo: AuthToken = data?.user || jwtDecode(data.access);
        setUser(userInfo);
        localStorage.setItem('authTokens', JSON.stringify(data));
        if (userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
        navigate('/'); // Redirect to home page after login
      } else {
        alert('Something went wrong!');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    localStorage.removeItem('userInfo');
    navigate('/register'); // Redirect to register page after logout
  };

  const contextData = {
    user,
    authTokens,
    loginUser,
    logoutUser,
  };

  useEffect(() => {
    if (authTokens) {
      try {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(jwtDecode(authTokens.access));
        }
      } catch (e) {
        try {
          setUser(jwtDecode(authTokens.access));
        } catch (_) {
          setUser(null);
        }
      }
    }
    setLoading(false);
  }, [authTokens, loading]);

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
