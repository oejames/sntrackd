import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        if (!user?._id) {
          setError('User not found');
          return;
        }

        console.log('Fetching reviews for user:', user._id);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/${user._id}/reviews`
        );
        
        // Filter out any reviews with missing sketch data
        const validReviews = response.data.filter(review => review.sketch);
        setReviews(validReviews);
        setError('');
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        setError('Failed to load your reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-blue-50 text-blue-600 p-4 rounded-lg">
          <Link to="/login" className="hover:underline">Please log in to view your profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#14181c]">
    {/* Profile Header */}
    <div className="bg-[#2c3440]">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="flex items-start gap-8">
          {/* Profile Avatar */}
          <div className="w-32 h-32 bg-[#14181c] rounded-full flex items-center justify-center">
            <span className="text-4xl text-[#9ab]">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Profile Info */}
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              {user?.username}
            </h1>
            <div className="text-[#9ab] space-y-1">
              {/* <p>Member since {new Date(user?.createdAt).toLocaleDateString()}</p> */}
              <p>{reviews.length} reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Profile Content */}
    <div className="max-w-[1200px] mx-auto px-4 py-12">
      {/* Recent Reviews */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-6">Recent Reviews</h2>
        
        {error ? (
          <div className="bg-red-900/20 text-red-400 p-4 rounded">
            {error}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-8">
            {reviews.map((review) => (
              <div key={review._id} className="bg-[#2c3440] rounded-lg overflow-hidden">
                <Link 
                  to={`/sketch/${review.sketch._id}`}
                  className="flex gap-6 p-6 hover:bg-[#384250] transition-colors"
                >
                  {/* Sketch Thumbnail */}
                  <div className="w-32 h-20 flex-shrink-0">
                    <img
                      src={review.sketch.thumbnails?.[0]?.url}
                      alt={review.sketch.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  {/* Review Content */}
                  <div className="flex-grow">
                    <h3 className="text-xl text-white font-semibold mb-2">
                      {review.sketch.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="text-[#00c030]" size={16} />
                      <span className="text-white">{review.rating}</span>
                    </div>

                    {review.text && (
                      <p className="text-[#9ab] line-clamp-2">{review.text}</p>
                    )}

                    <div className="mt-2 text-sm text-[#678]">
                      Reviewed {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[#9ab] text-center py-12">
            No reviews yet.
            <br />
            <Link to="/" className="text-[#00c030] hover:text-[#00e054] mt-2 inline-block">
              Start watching and reviewing sketches
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#2c3440] p-6 rounded-lg">
          <h3 className="text-[#9ab] text-sm font-semibold mb-2">SKETCHES</h3>
          <p className="text-3xl text-white">{reviews.length}</p>
        </div>
        
        <div className="bg-[#2c3440] p-6 rounded-lg">
          <h3 className="text-[#9ab] text-sm font-semibold mb-2">LISTS</h3>
          <p className="text-3xl text-white">0</p>
        </div>

        <div className="bg-[#2c3440] p-6 rounded-lg">
          <h3 className="text-[#9ab] text-sm font-semibold mb-2">FOLLOWERS</h3>
          <p className="text-3xl text-white">0</p>
        </div>

        <div className="bg-[#2c3440] p-6 rounded-lg">
          <h3 className="text-[#9ab] text-sm font-semibold mb-2">FOLLOWING</h3>
          <p className="text-3xl text-white">0</p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Profile;






