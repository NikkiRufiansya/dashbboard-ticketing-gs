// src/components/UserProfile/users.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import env from '../../config/env';

interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    currentPassword: '',
    role: 'user' as 'user' | 'admin',
  });
  const navigate = useNavigate();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${env.api.url}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        const errBody = contentType.includes('application/json') ? await response.json().catch(() => ({})) : await response.text();
        const message = typeof errBody === 'string' ? errBody.slice(0, 200) : (errBody.message || `Failed to fetch users: ${response.statusText}`);
        throw new Error(message);
      }

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Unexpected response (not JSON): ${text.slice(0, 200)}`);
      }

      const result = await response.json();
      // Handle both array and { data: array } response formats
      const usersData = Array.isArray(result) ? result : (result.data || []);
      
      if (!Array.isArray(usersData)) {
        throw new Error('Invalid users data format received from server');
      }

      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      console.log('Creating user with data:', {
        ...formData,
        password: '***' // Don't log actual password
      });
      
      // Use /register endpoint for user creation
      const response = await fetch(`${env.api.url}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          role: formData.role.toLowerCase()
        })
      });

      const addContentType = response.headers.get('content-type') || '';
      let responseData: any = {};
      if (addContentType.includes('application/json')) {
        responseData = await response.json().catch(() => ({}));
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`Unexpected response (not JSON): ${text.slice(0, 200)}`);
        }
      }
      console.log('Create user response:', response.status, responseData);

      if (!response.ok) {
        throw new Error((responseData && responseData.message) || 'Failed to add user');
      }

      // Show success notification
      toast.success('User created successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setShowAddModal(false);
setFormData({ username: '', name: '', password: '', currentPassword: '', role: 'user' });
      setError(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    }
  };

  // Handle edit user
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');
      
      // Validate password change
      if (formData.password && !formData.currentPassword) {
        throw new Error('Current password is required to change password');
      }

      // Prepare update data
      const updateData: any = {
        name: formData.name,
        role: formData.role.toLowerCase()
      };

      // Only include password fields if new password is provided
      if (formData.password) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.password;
      }

      // Single request to update both user data and password (if provided)
      const response = await fetch(`${env.api.url}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const updContentType = response.headers.get('content-type') || '';
      let result: any = {};
      if (updContentType.includes('application/json')) {
        result = await response.json().catch(() => ({}));
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`Unexpected response (not JSON): ${text.slice(0, 200)}`);
        }
      }
      console.log('Update user response:', response.status, result);
      
      if (!response.ok) {
        throw new Error((result && result.message) || 'Failed to update user');
      }

      // Show success notification
      toast.success('User updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setShowEditModal(false);
      setFormData({ username: '', name: '', password: '', currentPassword: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${env.api.url}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const delContentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const errBody = delContentType.includes('application/json') ? await response.json().catch(() => ({})) : await response.text();
        const message = typeof errBody === 'string' ? errBody.slice(0, 200) : (errBody.message || 'Failed to delete user');
        throw new Error(message);
      }

      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  // Handle edit button click
  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      password: '',
      currentPassword: '',
      role: user.role,
    });
    setShowEditModal(true);
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    handleEditClick(user);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({ username: '', name: '', password: '', currentPassword: '', role: 'user' });
    setError(null);
  };

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => {
            setFormData({ username: '', name: '', password: '', currentPassword: '', role: 'user' });
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Add New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                No.
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Username
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Role
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users && users.length > 0 ? (
              users.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap border">{index + 1}</td>
                <td className="px-4 py-2 whitespace-nowrap border">{user.username}</td>
                <td className="px-4 py-2 whitespace-nowrap border">{user.name}</td>
                <td className="px-4 py-2 whitespace-nowrap border">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="px-2 py-1 bg-blue-500 text-white rounded-md mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showAddModal || showEditModal ? 'block' : 'hidden'}`} onClick={handleCloseModal}>
        <div className="bg-white p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{currentUser ? 'Edit User' : 'Add New User'}</h2>
            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleEditUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                  disabled
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
            
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;