import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import type { 
  User, 
  UpdateProfileData} from '../services/authService';
import { 
  getStoredAuthData, 
  clearAuthData, 
  updatePassword as updateUserPassword
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context type for use in other files
export type { AuthContextType };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const { user: storedUser } = getStoredAuthData();
        if (storedUser) {
          setUser(storedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // Ensure auth data is in sync with localStorage
    const { token } = getStoredAuthData();
    if (!token) {
      // If no token in localStorage, clear the user
      setUser(null);
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    // Use window.location to fully reset the app state
    window.location.href = '/login';
  };

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<void> => {
    try {
      setUser(prevUser => {
        if (!prevUser) return prevUser;
        return {
          ...prevUser,
          name: data.name || prevUser.name,
          username: data.username || prevUser.username,
          // Preserve other user properties
          id: prevUser.id,
          role: prevUser.role
        };
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await updateUserPassword(currentPassword, newPassword);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// This is a custom hook that must be used within an AuthProvider
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };
