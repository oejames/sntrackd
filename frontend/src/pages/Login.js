// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await login(email, password);
//       navigate('/');
//     } catch (error) {
//       setError('Invalid login credentials');
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6">Login</h2>
//       {error && <div className="text-red-500 mb-4">{error}</div>}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-3 py-2 border rounded-lg"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Password</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full px-3 py-2 border rounded-lg"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
//         >
//           Login
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;

// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 ">
      <div className="bg-[#2c3440] p-8 rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-8 text-center">Sign In</h1>
        
        {error && (
          <div className="bg-red-900/20 text-red-400 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#9ab] text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#14181c] border border-[#456] rounded focus:outline-none focus:border-[#00c030] text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[#9ab] text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#14181c] border border-[#456] rounded focus:outline-none focus:border-[#00c030] text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#00c030] hover:bg-[#00e054] text-white py-3 rounded font-semibold transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-[#9ab]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#00c030] hover:text-[#00e054] transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;