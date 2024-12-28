// src/pages/Sketches.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import axios from 'axios';

const Sketches = () => {
  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const fetchSketches = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sketches`, {
        params: {
          page,
          sortBy,
          limit: 12
        }
      });
      setSketches(response.data.sketches);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Failed to load sketches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSketches();
  }, [page, sortBy]);

  return (
    <div className="min-h-screen bg-[#14181c]">
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-[#9ab]">SKETCHES</h1>
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-[#2c3440] text-[#9ab] px-4 py-2 rounded border border-[#456]
                     focus:outline-none focus:border-[#00c030]"
          >
            <option value="newest">Newest</option>
            {/* <option value="oldest">Oldest</option> */}
            <option value="popular">Most Reviewed</option>
          </select>
        </div>
      </div>

        {error ? (
          <div className="bg-red-900/20 text-red-400 p-4 rounded">
            {error}
          </div>
        ) : (
          <>
  
        {/* Sketches Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sketches.map(sketch => (
                <Link
                  key={sketch._id}
                  to={`/sketch/${sketch._id}`}
                  className="group"
                >
                  <div className="aspect-video bg-[#2c3440] rounded overflow-hidden">
                    <img
                      src={sketch.thumbnails?.[2].url}
                      alt={sketch.title}
                      className="w-full h-full object-cover transform transition-transform 
                               group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-white font-medium group-hover:text-[#00c030] 
                                 transition-colors line-clamp-1">
                      {sketch.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-[#9ab] mt-1">
                      <div className="flex items-center">
                        <Star className="text-[#00c030] w-4 h-4 mr-1" />
                        <span>
                          {sketch.averageRating}
                        </span>
                      </div>
                      <span>{sketch.reviewCount} reviews</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {sketches.map(sketch => (
    <Link key={sketch._id} to={`/sketch/${sketch._id}`} className="group">
      <div className="aspect-video bg-[#2c3440] rounded overflow-hidden">
        <img src={sketch.thumbnails?.[2].url} alt={sketch.title} className="w-full h-full object-cover transform transition-transform group-hover:scale-105" />
      </div>
      <div className="mt-2">
        <h3 className="text-white font-medium group-hover:text-[#00c030] transition-colors line-clamp-1">
          {sketch.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-[#9ab] mt-1">
          <div className="flex items-center">
            <Star className="text-[#00c030] w-4 h-4 mr-1" />
            <span>{sketch.averageRating}</span>
          </div>
          <span>{sketch.reviewCount} reviews</span>
        </div>
      </div>
    </Link>
  ))}
</div> */}
        {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sketches.map(sketch => (
            <Link
              key={sketch._id}
              to={`/sketch/${sketch._id}`}
              className="group"
            >
              <div className="aspect-video bg-[#2c3440] rounded overflow-hidden">
                <img
                  src={sketch.thumbnails?.[2].url}
                  alt={sketch.title}
                  className="w-full h-full object-cover transform transition-transform 
                           group-hover:scale-105"
                />
              </div>
              <div className="mt-2">
                <h3 className="text-white font-medium group-hover:text-[#00c030] 
                             transition-colors line-clamp-1">
                  {sketch.title}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-[#9ab]">
                    {sketch.publishedTimeText?.simpleText}
                  </span>
                  {sketch.reviewCount > 0 && (
                    <span className="text-sm text-[#9ab]">
                      {sketch.reviewCount} {sketch.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div> */}

            {/* Pagination */}
            <div className="flex justify-center mt-8 gap-4">
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

export default Sketches;