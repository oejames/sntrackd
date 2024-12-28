import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProfilePhoto = ({ userData, onPhotoUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { user, token, logout } = useAuth();
  
  const isOwnProfile = user?._id === userData?._id;

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setError('');
      setUploading(true);

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5MB');
      }

      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/photo`,
        formData
      );

      if (onPhotoUpdate) {
        onPhotoUpdate(response.data.photoUrl);
      }

    } catch (err) {
      console.error('Upload error:', err);
      
      if (err.response?.status === 401) {
        logout();  // This will clear token and user state
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.response?.data?.error || 'Failed to upload photo. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setError('');
      setUploading(true);

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/users/photo`
      );

      if (onPhotoUpdate) {
        onPhotoUpdate(null);
      }

    } catch (err) {
      console.error('Remove error:', err);
      
      if (err.response?.status === 401) {
        logout();
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to remove photo. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  if (!userData) return null;

  return (
    <div className="relative">
      <div 
        className={`w-32 h-32 rounded-full overflow-hidden bg-[#14181c] flex items-center justify-center 
          ${isOwnProfile && !userData.photoUrl ? 'border-2 border-dashed border-gray-600 hover:border-[#00c030]' : ''}
          ${uploading ? 'cursor-wait' : isOwnProfile ? 'cursor-pointer' : 'cursor-default'}
          transition-colors group`}
        onClick={() => {
          if (isOwnProfile && !uploading) {
            document.getElementById('photo-upload').click();
          }
        }}
      >
        {userData.photoUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={userData.photoUrl} 
              alt={userData.username} 
              className={`w-full h-full object-cover ${uploading ? 'opacity-50' : ''}`}
            />
            {isOwnProfile && !uploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-8 h-8 border-2 border-t-transparent border-[#00c030] rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <span className="text-4xl text-[#9ab] group-hover:text-[#00c030] transition-colors">
              {userData.username?.charAt(0).toUpperCase()}
            </span>
            {isOwnProfile && !uploading && (
              <span className="text-xs text-gray-400 mt-1 group-hover:text-[#00c030] transition-colors">
                Add Photo
              </span>
            )}
          </div>
        )}

        {isOwnProfile && (
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        )}
      </div>

      {isOwnProfile && userData.photoUrl && !uploading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemovePhoto();
          }}
          className="absolute -top-2 -right-2 p-1.5 bg-[#2c3440] rounded-full text-gray-400 hover:text-[#00c030] hover:bg-[#384250] transition-colors z-10"
          type="button"
        >
          <X size={16} />
        </button>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-500 bg-red-950/20 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfilePhoto;