import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password
        }
      );
      
      // Log in the user after successful registration
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
  //   <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
  //     <h2 className="text-2xl font-bold mb-6">Register</h2>
  //     {error && <div className="text-red-500 mb-4">{error}</div>}
      
  //     <form onSubmit={handleSubmit} className="space-y-4">
  //       <div>
  //         <label className="block text-sm font-medium mb-1">Username</label>
  //         <input
  //           type="text"
  //           name="username"
  //           value={formData.username}
  //           onChange={handleChange}
  //           className="w-full px-3 py-2 border rounded-lg"
  //           required
  //         />
  //       </div>
        
  //       <div>
  //         <label className="block text-sm font-medium mb-1">Email</label>
  //         <input
  //           type="email"
  //           name="email"
  //           value={formData.email}
  //           onChange={handleChange}
  //           className="w-full px-3 py-2 border rounded-lg"
  //           required
  //         />
  //       </div>
        
  //       <div>
  //         <label className="block text-sm font-medium mb-1">Password</label>
  //         <input
  //           type="password"
  //           name="password"
  //           value={formData.password}
  //           onChange={handleChange}
  //           className="w-full px-3 py-2 border rounded-lg"
  //           required
  //         />
  //       </div>
        
  //       <div>
  //         <label className="block text-sm font-medium mb-1">Confirm Password</label>
  //         <input
  //           type="password"
  //           name="confirmPassword"
  //           value={formData.confirmPassword}
  //           onChange={handleChange}
  //           className="w-full px-3 py-2 border rounded-lg"
  //           required
  //         />
  //       </div>
        
  //       <button
  //         type="submit"
  //         className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
  //       >
  //         Register
  //       </button>
  //     </form>
  //   </div>
  // );
  <div className="min-h-screen bg-[#14181c] py-16 px-4">
  <div className="max-w-md mx-auto">
    <div className="bg-[#2c3440] p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Create Account</h2>
      
      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[#9ab] text-sm font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#14181c] border border-[#456] rounded 
                     text-white focus:outline-none focus:border-[#00c030]"
            required
          />
        </div>
        
        <div>
          <label className="block text-[#9ab] text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#14181c] border border-[#456] rounded 
                     text-white focus:outline-none focus:border-[#00c030]"
            required
          />
        </div>
        
        <div>
          <label className="block text-[#9ab] text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#14181c] border border-[#456] rounded 
                     text-white focus:outline-none focus:border-[#00c030]"
            required
          />
        </div>
        
        <div>
          <label className="block text-[#9ab] text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#14181c] border border-[#456] rounded 
                     text-white focus:outline-none focus:border-[#00c030]"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-[#00c030] hover:bg-[#00e054] text-white py-3 rounded 
                   font-semibold transition-colors"
        >
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-[#9ab]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#00c030] hover:text-[#00e054] transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  </div>
</div>
  );

};

export default Register;