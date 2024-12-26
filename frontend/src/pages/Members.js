import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Members = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
        setUsers(response.data);
      } catch (error) {
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14181c] flex items-center justify-center">
        <div className="text-[#9ab]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#14181c] px-4 py-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-red-900/20 text-red-400 p-4 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14181c]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-[#9ab] mb-8">MEMBERS</h1>
        
        <div className="grid gap-4">
          {users.map(user => (
            <Link 
              key={user._id}
              to={`/members/${user._id}`}
              className="bg-[#2c3440] p-4 rounded hover:bg-[#384250] transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* User avatar */}
                <div className="w-12 h-12 bg-[#14181c] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg text-[#9ab]">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>

                <div>
                  <h2 className="text-white font-medium">{user.username}</h2>
                  <p className="text-sm text-[#9ab]">
                    {user.reviewCount || 0} reviews 
                    {user.favoriteSketchIds?.length > 0 && ` • ${user.favoriteSketchIds.length} favorites`}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Members;