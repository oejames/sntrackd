// src/components/ReviewList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const ReviewList = ({ reviews }) => {
  if (!reviews?.length) {
    return (
      <div className="text-[#9ab] text-center py-8">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border-t border-[#2c3440] py-6">
          <div className="flex gap-4">
            {/* User Avatar/Info Section */}
            <div className="flex-shrink-0">
              <Link to={`/profile/${review.user._id}`}>
                <div className="w-12 h-12 bg-[#2c3440] rounded-full flex items-center justify-center">
                  <span className="text-[#9ab] text-lg font-semibold">
                    {review.user.username?.[0].toUpperCase()}
                  </span>
                </div>
              </Link>
            </div>

            {/* Review Content */}
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <Link 
                  to={`/profile/${review.user._id}`}
                  className="text-[#9ab] hover:text-[#00c030] transition-colors"
                >
                  {review.user.username}
                </Link>
                <span className="text-[#678]">•</span>
                <div className="flex items-center">
                  <Star className="text-[#00c030] w-4 h-4" />
                  <span className="text-white ml-1">{review.rating}</span>
                </div>
              </div>

              {/* Review Text */}
              {review.text && (
                <p className="text-[#9ab] text-sm leading-relaxed">{review.text}</p>
              )}

              {/* Review Date */}
              <div className="mt-2 text-xs text-[#678]">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;