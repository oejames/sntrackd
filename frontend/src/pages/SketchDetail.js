// src/pages/SketchDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const SketchDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [sketch, setSketch] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [sketchRes, reviewsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/sketches/${id}`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/sketches/${id}/reviews`)
        ]);

        if (mounted) {
          setSketch(sketchRes.data);
          setReviews(reviewsRes.data);
          setError('');
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load sketch');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { mounted = false };
  }, [id]);

  const handleReviewSubmitted = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
    setSketch(prev => ({
      ...prev,
      averageRating: newReview.rating // This will be updated properly on next fetch
    }));
  };

  // if (loading) {
  //   return (
  //     <div className="max-w-4xl mx-auto py-8 px-4">
  //       <div className="text-center">Loading...</div>
  //     </div>
  //   );
  // }

  // if (error || !sketch) {
  //   return (
  //     <div className="max-w-4xl mx-auto py-8 px-4">
  //       <div className="bg-red-50 text-red-600 p-4 rounded-lg">
  //         {error || 'Sketch not found'}
  //       </div>
  //       <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
  //         ← Back to sketches
  //       </Link>
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14181c] pt-[72px] flex items-center justify-center">
        <div className="text-[#9ab]">Loading...</div>
      </div>
    );
  }

  if (error || !sketch) {
    return (
      <div className="min-h-screen bg-[#14181c] pt-[72px] px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
            {error || 'Sketch not found'}
          </div>
          <Link 
            to="/" 
            className="text-[#00c030] hover:text-[#00e054] mt-4 inline-block transition-colors"
          >
            ← Back to sketches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14181c] pt-[72px]"> {/* Added pt-[72px] here */}
      {/* Video and Title Section */}
      <div className="w-full bg-[#2c3440] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="aspect-video mb-6">
            <iframe
              src={`https://www.youtube.com/embed/${sketch.videoId}`}
              className="w-full h-full rounded"
              allowFullScreen
              title={sketch.title}
            />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{sketch.title}</h1>
          
          {sketch.description && (
            <p className="text-[#9ab] mb-4">{sketch.description}</p>
          )}

          <div className="flex items-center gap-4 text-[#9ab]">
            <span>{sketch.publishedTime}</span>
            <span>•</span>
            <span>{sketch.viewCount} views</span>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {user ? (
          <ReviewForm 
            sketchId={id}
            onReviewSubmitted={handleReviewSubmitted}
          />
        ) : (
          <div className="bg-[#2c3440] p-4 rounded text-center mb-8">
            <Link 
              to="/login" 
              className="text-[#00c030] hover:text-[#00e054] transition-colors"
            >
              Log in to write a review
            </Link>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
};

export default SketchDetail;