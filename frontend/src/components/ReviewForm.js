// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';

const ReviewForm = ({ sketchId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reviews`,
        { sketchId, rating, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setText('');
      setRating(0);
      onReviewSubmitted(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#2c3440] rounded p-6">
      <h3 className="text-xl text-white font-semibold mb-4">Write a Review</h3>
      
      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                size={24}
                className={star <= rating ? 'text-[#00c030]' : 'text-[#678]'}
                fill={star <= rating ? 'currentColor' : 'none'}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-[#9ab]">
              {rating} star{rating !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your review..."
          className="w-full px-4 py-3 bg-[#14181c] border border-[#456] rounded 
                   text-[#9ab] placeholder-[#678] focus:outline-none focus:border-[#00c030] 
                   resize-none"
          rows="4"
        />

        <button
          type="submit"
          disabled={submitting || !rating}
          className={`mt-4 px-6 py-2 rounded font-semibold transition-colors ${
            submitting || !rating 
              ? 'bg-[#456] text-[#9ab] cursor-not-allowed' 
              : 'bg-[#00c030] hover:bg-[#00e054] text-white'
          }`}
        >
          {submitting ? 'Posting...' : 'Post Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;