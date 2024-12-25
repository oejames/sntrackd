// src/components/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProfile = ({ user, onClose, onUpdate }) => {
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedSketches, setSelectedSketches] = useState(user?.topFourSketches || []);
  const [availableSketches, setAvailableSketches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available sketches
    const fetchSketches = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sketches`);
        setAvailableSketches(response.data.sketches);
      } catch (error) {
        console.error('Error fetching sketches:', error);
      }
    };
    fetchSketches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        {
          bio,
          topFourSketches: selectedSketches.map(sketch => sketch._id)
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      onUpdate(response.data);
      onClose();
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSketchSelect = (sketch) => {
    if (selectedSketches.length >= 4 && !selectedSketches.find(s => s._id === sketch._id)) {
      setError('Maximum 4 sketches allowed');
      return;
    }
    
    setSelectedSketches(prev => {
      const exists = prev.find(s => s._id === sketch._id);
      if (exists) {
        return prev.filter(s => s._id !== sketch._id);
      }
      return [...prev, sketch];
    });
  };

  return (
    <div className="bg-[#2c3440] p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
      
      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[#9ab] mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-2 bg-[#14181c] border border-[#456] rounded text-white"
            rows="4"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className="block text-[#9ab] mb-2">
            Top Four Sketches ({selectedSketches.length}/4)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {availableSketches.map(sketch => (
              <button
                key={sketch._id}
                type="button"
                onClick={() => handleSketchSelect(sketch)}
                className={`p-2 text-left rounded ${
                  selectedSketches.find(s => s._id === sketch._id)
                    ? 'bg-[#00c030] text-white'
                    : 'bg-[#14181c] text-[#9ab] hover:bg-[#456]'
                }`}
              >
                {sketch.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#456] text-white rounded hover:bg-[#567]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#00c030] text-white rounded hover:bg-[#00e054] disabled:bg-[#456]"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;