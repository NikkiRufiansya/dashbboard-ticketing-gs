import env from '../config/env';

interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UpdateProfileData {
  name: string;
  username: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${env.api.url}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  
  // Store the auth data in localStorage
  if (data.token && data.user) {
    storeAuthData(data);
  }
  
  return data;
};

// Store token in localStorage
export const storeAuthData = (data: AuthResponse) => {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
};

// Clear auth data on logout
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// Get stored auth data
export const getStoredAuthData = (): { token: string | null; user: User | null } => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null,
  };
};

// Update user profile
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  try {
    const authData = getStoredAuthData();
    console.log('Current auth data:', authData);
    
    if (!authData.token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    console.log('Updating profile with data:', data);
    
    const url = `${env.api.url}/users/me`;
    console.log('Making request to:', url);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`,
    };
    
    console.log('Request headers:', headers);
    
    let response;
    try {
      response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
      });
    } catch (networkError) {
      console.error('Network error during profile update:', networkError);
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }

    let responseData = {};
    try {
      responseData = await response.json();
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Invalid response from server');
    }
    
    console.log('Profile update response status:', response.status);
    console.log('Profile update response data:', responseData);

  
    // Update stored user data
    const { user } = getStoredAuthData();
    if (user) {
      const newUserData = { ...user, ...responseData };
      localStorage.setItem('user', JSON.stringify(newUserData));
    }
    
    // Cast responseData to User since we expect the API to return all required user fields
    return responseData as User;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update profile');
  }
};

// Update user password
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const { token } = getStoredAuthData();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${env.api.url}/users/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json() as { message?: string };
    throw new Error('message' in errorData ? errorData.message : 'Failed to update password');
  }
};
