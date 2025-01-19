import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import Review from './Review';
import UserAvatar from './UseAvatar';
// import StatsContent from './StatsContent';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProfileTabs = ({ 
  activeTab, 
  onTabChange, 
  userData, 
  reviews,
  isOwnProfile,
  onSelectFavorites,
  onFavoriteToggle,
  onDeleteReview,
  sortOption,
  onSortChange,
  onReviewUpdate
}) => {
  const tabs = ['profile', 'reviews', 'lists', 'following', 'stats'];

  const renderProfileContent = () => (
    <div>
      {/* Favorites Section */}
      {(isOwnProfile || userData?.favoriteSketchIds?.length > 0) && (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#9ab]">FAVORITE SKETCHES</h2>
            {isOwnProfile && (
              <button
                onClick={onSelectFavorites}
                className="text-[#00c030] hover:text-[#00e054]"
              >
                {userData?.favoriteSketchIds?.length ? 'Edit Favorites' : 'Select Favorites'}
              </button>
            )}
          </div>

          {userData?.favoriteSketchIds?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userData.favoriteSketchIds.map(sketch => (
                <Link
                  key={sketch._id}
                  to={`/sketch/${sketch._id}`}
                  className="aspect-video bg-[#2c3440] rounded overflow-hidden group"
                >
                  <div className="w-full h-full relative">
                    <img
                      src={sketch.thumbnails?.[2]?.url}
                      alt={sketch.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium px-2 text-center">
                        {sketch.title}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : isOwnProfile && (
            <div className="text-center py-8 text-[#9ab]">
              <p className="mb-4">Don't forget to select your favorite sketches!</p>
            </div>
          )}
        </div>
      )}

      {/* Pinned Reviews */}
    {reviews.some(review => review.pinned) && (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-[#9ab] mb-6">PINNED REVIEWS</h2>
        <div className="grid gap-8">
          {reviews
            .filter(review => review.pinned)
            .map((review) => (
              <Review
                key={review._id}
                review={review}
                isOwnProfile={isOwnProfile}
                onDeleteReview={onDeleteReview}
                onReviewUpdate={onReviewUpdate}
              />
            ))}
        </div>
      </div>
    )}


      {/* Recent Reviews */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-[#9ab] mb-6">RECENT REVIEWS</h2>
        <div className="grid gap-8">
          {reviews.slice(0, 5).map((review) => (
            <Review
            key={review._id}
            review={review}
            isOwnProfile={isOwnProfile}
            onDeleteReview={onDeleteReview}
            onReviewUpdate={onReviewUpdate} 
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviewsContent = () => {
    const sortReviews = (reviews) => {
      const sortedReviews = [...reviews];
      switch (sortOption) {
        case 'oldest':
          return sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'highestRating':
          return sortedReviews.sort((a, b) => b.rating - a.rating);
        case 'lowestRating':
          return sortedReviews.sort((a, b) => a.rating - b.rating);
        case 'newest':
        default:
          return sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    };

    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#9ab]">ALL REVIEWS</h2>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-[#2c3440] text-[#9ab] p-2 rounded"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Earliest First</option>
            <option value="highestRating">Highest Rating</option>
            <option value="lowestRating">Lowest Rating</option>
          </select>
        </div>
        <div className="grid gap-8">
          {sortReviews(reviews).map((review) => (
            <Review
            key={review._id}
            review={review}
            isOwnProfile={isOwnProfile}
            onDeleteReview={onDeleteReview}
            onReviewUpdate={onReviewUpdate}  
          />
          ))}
        </div>
      </div>
    );
  };

  const renderFollowingContent = () => (
        <div>
          {/* Following Section */}
          {userData?.following?.length > 0 && (
            <div className="max-w-[1200px] mx-auto px-4 py-8">
              <h2 className="text-xl font-semibold text-[#9ab] mb-6">FOLLOWING</h2>
              <div className="flex flex-wrap gap-4">
                {userData?.following.map(user => (
                  <Link
                    key={user._id}
                    to={`/profile/${user._id}`}
                    className="flex items-center gap-2 bg-[#2c3440] p-2 rounded hover:bg-[#384250] transition-colors"
                  >
                    <UserAvatar user={user} size="small" />
                    <span className="text-[#9ab] hover:text-[#00c030] transition-colors">
                      {user.username}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
      
          {/* Followers Section - Only shown if it's the user's own profile */}
          {userData?.followers?.length > 0 && isOwnProfile && (
            <div className="max-w-[1200px] mx-auto px-4 py-8">
              <h2 className="text-xl font-semibold text-[#9ab] mb-6">FOLLOWERS</h2>
              <div className="flex flex-wrap gap-4">
                {userData?.followers.map(user => (
                  <Link
                    key={user._id}
                    to={`/profile/${user._id}`}
                    className="flex items-center gap-2 bg-[#2c3440] p-2 rounded hover:bg-[#384250] transition-colors"
                  >
                    <UserAvatar user={user} size="small" />
                    <span className="text-[#9ab] hover:text-[#00c030] transition-colors">
                      {user.username}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
      
          {/* No Following Message */}
          {(!userData?.following?.length && !userData?.followers?.length) && (
            <div className="max-w-[1200px] mx-auto px-4 py-8 text-center">
              <p className="text-[#9ab]">No following or followers yet.</p>
            </div>
          )}
        </div>
      )


  const renderListsContent = () => (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-[#9ab] mb-6">LISTS</h2>
      <p className="text-[#9ab]">Coming soon!</p>
    </div>
  );

//   const renderStatsContent = () => (
//     <div className="max-w-[1200px] mx-auto px-4 py-8">
//       <h2 className="text-xl font-semibold text-[#9ab] mb-6">STATS</h2>
//       <StatsContent></StatsContent>
//       {/* <p className="text-[#9ab]">Coming soon!</p> */}
//     </div>
//   );
const renderStatsContent = () => {
    if (!reviews || reviews.length === 0) {
      return (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h2 className="text-xl font-semibold text-[#9ab] mb-6">STATS</h2>
          <p className="text-[#9ab]">No reviews yet to generate stats.</p>
        </div>
      );
    }
  
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
  
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-[#9ab] mb-6">STATS</h2>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#2c3440] p-6 rounded-lg">
            <h3 className="text-[#9ab] text-sm font-semibold mb-2">TOTAL REVIEWS</h3>
            <p className="text-3xl text-white">{reviews.length}</p>
          </div>
          
          <div className="bg-[#2c3440] p-6 rounded-lg">
            <h3 className="text-[#9ab] text-sm font-semibold mb-2">AVERAGE RATING</h3>
            <div className="flex items-center">
              <Star className="text-[#00c030] mr-2" size={24} />
              <p className="text-3xl text-white">{avgRating.toFixed(1)}</p>
            </div>
          </div>
  
          <div className="bg-[#2c3440] p-6 rounded-lg">
            <h3 className="text-[#9ab] text-sm font-semibold mb-2">MOST REVIEWS IN A DAY</h3>
            <p className="text-3xl text-white">{maxReviewsInDay}</p>
            <p className="text-sm text-[#9ab] mt-1">{mostActiveDate}</p>
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
              <BarChart data={ratingData}>
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

  const renderContent = () => {
    switch (activeTab) {
      case 'reviews':
        return renderReviewsContent();
      case 'lists':
        return renderListsContent();
      case 'following':
        return renderFollowingContent();
      case 'stats':
        return renderStatsContent();
      case 'profile':
      default:
        return renderProfileContent();
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      {/* <div className="border-t border-[#456]">
        <div className="max-w-[1200px] mx-auto px-4">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-[#00c030]'
                    : 'text-[#9ab] hover:text-white'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </div> */}
        <div className="border-t border-[#456] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-[#00c030]'
                    : 'text-[#9ab] hover:text-white'
                }`}
                style={{
                  fontSize: 'clamp(10px, 0.9vw, 14px)', // Shrinks the text only if necessary
                  whiteSpace: 'nowrap', // Prevents text wrapping
                  overflow: 'hidden', // Prevents overflow
                  textOverflow: 'ellipsis', // Adds "..." if text overflows
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
};


export default ProfileTabs;