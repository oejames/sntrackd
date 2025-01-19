// components/Review.js (THIS IS FOR LIKE ON PROFILES THE LITTLE REVIEW CARD IN RECENT REVIEWS AND REVIEW TAB)
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2, Pin } from 'lucide-react';
import axios from 'axios';

const Review = ({ review, isOwnProfile, onDeleteReview, onReviewUpdate }) => {
  const handlePinToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

     // confirmation dialog
    const action = review.pinned ? 'unpin' : 'pin';
    if (!window.confirm(`Are you sure you want to ${action} this review?`)) {
        return;
    }

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/reviews/${review._id}/pin`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (response.status === 200) {
        if (onReviewUpdate) {
          onReviewUpdate(response.data);
        }
      }
    } catch (error) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Error updating review');
      }
    }
  };

  return (
    <div className="bg-[#2c3440] rounded-lg overflow-hidden">
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

          <div className="mt-2 text-sm flex justify-between items-center">
            <div className="text-[#678]">
              Reviewed {new Date(review.createdAt).toLocaleDateString()}
            </div>
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePinToggle}
                  className={`text-[#9ab] hover:text-[#00c030] transition-colors ${
                    review.pinned ? 'text-[#00c030]' : ''
                  }`}
                >
                  <Pin size={16} className={review.pinned ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this review?')) {
                      onDeleteReview(review._id);
                    }
                  }}
                  className="text-[#9ab] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Review;