import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';

const StatsContent = ({ reviews }) => {
  const stats = useMemo(() => {
    // Rating distribution
    const ratingDistribution = Array(5).fill(0);
    reviews.forEach(review => {
      ratingDistribution[Math.floor(review.rating) - 1]++;
    });
    const ratingData = ratingDistribution.map((count, i) => ({
      rating: `${i + 1} stars`,
      count
    }));

    // Average rating
    const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    // Most reviewed sketches in a day
    const reviewsByDate = {};
    reviews.forEach(review => {
      const date = new Date(review.createdAt).toLocaleDateString();
      reviewsByDate[date] = (reviewsByDate[date] || 0) + 1;
    });
    const maxReviewsInDay = Math.max(...Object.values(reviewsByDate));
    const mostActiveDate = Object.entries(reviewsByDate)
      .find(([_, count]) => count === maxReviewsInDay)?.[0];

    return {
      ratingData,
      totalReviews: reviews.length,
      avgRating: avgRating.toFixed(1),
      maxReviewsInDay,
      mostActiveDate
    };
  }, [reviews]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-[#9ab] mb-6">STATS</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#2c3440] p-6 rounded-lg">
          <h3 className="text-[#9ab] text-sm font-semibold mb-2">TOTAL REVIEWS</h3>
          <p className="text-3xl text-white">{stats.totalReviews}</p>
        </div>
        
        <div className="bg-[#2c3440] p-6 rounded-lg">
          <h3 className="text-[#9ab] text-sm font-semibold mb-2">AVERAGE RATING</h3>
          <div className="flex items-center">
            <Star className="text-[#00c030] mr-2" size={24} />
            <p className="text-3xl text-white">{stats.avgRating}</p>
          </div>
        </div>

        <div className="bg-[#2c3440] p-6 rounded-lg">
          <h3 className="text-[#9ab] text-sm font-semibold mb-2">MOST REVIEWS IN A DAY</h3>
          <p className="text-3xl text-white">{stats.maxReviewsInDay}</p>
          <p className="text-sm text-[#9ab] mt-1">{stats.mostActiveDate}</p>
        </div>

        <div className="bg-[#2c3440] p-6 rounded-lg">
          <h3 className="text-[#9ab] text-sm font-semibold mb-2">REVIEWS THIS MONTH</h3>
          <p className="text-3xl text-white">
            {reviews.filter(review => {
              const reviewDate = new Date(review.createdAt);
              const now = new Date();
              return reviewDate.getMonth() === now.getMonth() &&
                     reviewDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      <div className="bg-[#2c3440] p-6 rounded-lg mb-12">
        <h3 className="text-[#9ab] text-sm font-semibold mb-6">RATING DISTRIBUTION</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.ratingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#456" />
              <XAxis dataKey="rating" stroke="#9ab" />
              <YAxis stroke="#9ab" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#14181c',
                  border: '1px solid #456',
                  borderRadius: '4px'
                }}
                labelStyle={{ color: '#9ab' }}
              />
              <Bar dataKey="count" fill="#00c030" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Rated Sketches */}
      <div className="bg-[#2c3440] p-6 rounded-lg">
        <h3 className="text-[#9ab] text-sm font-semibold mb-6">HIGHEST RATED SKETCHES</h3>
        <div className="space-y-4">
          {reviews
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5)
            .map(review => (
              <div key={review._id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={review.sketch.thumbnails?.[0]?.url}
                    alt={review.sketch.title}
                    className="w-16 h-10 object-cover rounded"
                  />
                  <span className="text-white">{review.sketch.title}</span>
                </div>
                <div className="flex items-center">
                  <Star className="text-[#00c030] mr-1" size={16} />
                  <span className="text-white">{review.rating}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StatsContent;