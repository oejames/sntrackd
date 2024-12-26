// src/pages/Reviews.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import axios from 'axios';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews`, {
          params: { page, sortBy }
        });
        setReviews(response.data.reviews);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [page, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14181c] flex items-center justify-center">
        <div className="text-[#9ab]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14181c]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-[#9ab]">RECENT REVIEWS</h1>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-[#2c3440] text-[#9ab] px-4 py-2 rounded border border-[#456]
                     focus:outline-none focus:border-[#00c030]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {error ? (
          <div className="bg-red-900/20 text-red-400 p-4 rounded">
            {error}
          </div>
        ) : (
          <>
            <div className="space-y-6">
{reviews.map(review => review && review.sketch && review.user && (
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
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl text-white font-semibold">
            {review.sketch.title}
          </h3>
          <div className="flex items-center">
            <Star className="text-[#00c030]" size={16} />
            <span className="ml-1 text-white">{review.rating}</span>
          </div>
        </div>

        <p className="text-[#9ab] line-clamp-2 mb-2">{review.text}</p>

        <div className="flex items-center gap-2 text-sm text-[#678]">
          <Link 
            to={`/profile/${review.user._id}`}
            className="hover:text-[#9ab] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {review.user.username}
          </Link>
          <span>•</span>
          <span>
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  </div>
))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${
                  page === 1
                    ? 'bg-[#2c3440] text-[#678] cursor-not-allowed'
                    : 'bg-[#2c3440] text-[#9ab] hover:bg-[#384250]'
                }`}
              >
                Previous
              </button>
              <span className="flex items-center text-[#9ab]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded ${
                  page === totalPages
                    ? 'bg-[#2c3440] text-[#678] cursor-not-allowed'
                    : 'bg-[#2c3440] text-[#9ab] hover:bg-[#384250]'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;