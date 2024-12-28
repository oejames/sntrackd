// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Star } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';

// const Profile = () => {
//   const { user } = useAuth();
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchUserReviews = async () => {
//       try {
//         if (!user?._id) {
//           setError('User not found');
//           return;
//         }

//         console.log('Fetching reviews for user:', user._id);
//         const response = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/users/${user._id}/reviews`
//         );
        
//         // Filter out any reviews with missing sketch data
//         const validReviews = response.data.filter(review => review.sketch);
//         setReviews(validReviews);
//         setError('');
//       } catch (error) {
//         console.error('Error fetching user reviews:', error);
//         setError('Failed to load your reviews');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserReviews();
//   }, [user]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-xl text-gray-600">Loading...</div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="max-w-4xl mx-auto py-8 px-4">
//         <div className="bg-blue-50 text-blue-600 p-4 rounded-lg">
//           <Link to="/login" className="hover:underline">Please log in to view your profile</Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#14181c]">
//     {/* Profile Header */}
//     <div className="bg-[#2c3440]">
//       <div className="max-w-[1200px] mx-auto px-4 py-12">
//         <div className="flex items-start gap-8">
//           {/* Profile Avatar */}
//           <div className="w-32 h-32 bg-[#14181c] rounded-full flex items-center justify-center">
//             <span className="text-4xl text-[#9ab]">
//               {user?.username?.charAt(0).toUpperCase()}
//             </span>
//           </div>

//           {/* Profile Info */}
//           <div>
//             <h1 className="text-3xl font-semibold text-white mb-2">
//               {user?.username}
//             </h1>
//             <div className="text-[#9ab] space-y-1">
//               {/* <p>Member since {new Date(user?.createdAt).toLocaleDateString()}</p> */}
//               <p>{reviews.length} reviews</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Profile Content */}
//     <div className="max-w-[1200px] mx-auto px-4 py-12">
//       {/* Recent Reviews */}
//       <div className="mb-12">
//         <h2 className="text-2xl font-semibold text-white mb-6">Recent Reviews</h2>
        
//         {error ? (
//           <div className="bg-red-900/20 text-red-400 p-4 rounded">
//             {error}
//           </div>
//         ) : reviews.length > 0 ? (
//           <div className="grid gap-8">
//             {reviews.map((review) => (
//               <div key={review._id} className="bg-[#2c3440] rounded-lg overflow-hidden">
//                 <Link 
//                   to={`/sketch/${review.sketch._id}`}
//                   className="flex gap-6 p-6 hover:bg-[#384250] transition-colors"
//                 >
//                   {/* Sketch Thumbnail */}
//                   <div className="w-32 h-20 flex-shrink-0">
//                     <img
//                       src={review.sketch.thumbnails?.[0]?.url}
//                       alt={review.sketch.title}
//                       className="w-full h-full object-cover rounded"
//                     />
//                   </div>

//                   {/* Review Content */}
//                   <div className="flex-grow">
//                     <h3 className="text-xl text-white font-semibold mb-2">
//                       {review.sketch.title}
//                     </h3>
                    
//                     <div className="flex items-center gap-2 mb-2">
//                       <Star className="text-[#00c030]" size={16} />
//                       <span className="text-white">{review.rating}</span>
//                     </div>

//                     {review.text && (
//                       <p className="text-[#9ab] line-clamp-2">{review.text}</p>
//                     )}

//                     <div className="mt-2 text-sm text-[#678]">
//                       Reviewed {new Date(review.createdAt).toLocaleDateString()}
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-[#9ab] text-center py-12">
//             No reviews yet.
//             <br />
//             <Link to="/" className="text-[#00c030] hover:text-[#00e054] mt-2 inline-block">
//               Start watching and reviewing sketches
//             </Link>
//           </div>
//         )}
//       </div>

//       {/* Stats Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-[#2c3440] p-6 rounded-lg">
//           <h3 className="text-[#9ab] text-sm font-semibold mb-2">SKETCHES</h3>
//           <p className="text-3xl text-white">{reviews.length}</p>
//         </div>
        
//         <div className="bg-[#2c3440] p-6 rounded-lg">
//           <h3 className="text-[#9ab] text-sm font-semibold mb-2">LISTS</h3>
//           <p className="text-3xl text-white">0</p>
//         </div>

//         <div className="bg-[#2c3440] p-6 rounded-lg">
//           <h3 className="text-[#9ab] text-sm font-semibold mb-2">FOLLOWERS</h3>
//           <p className="text-3xl text-white">0</p>
//         </div>

//         <div className="bg-[#2c3440] p-6 rounded-lg">
//           <h3 className="text-[#9ab] text-sm font-semibold mb-2">FOLLOWING</h3>
//           <p className="text-3xl text-white">0</p>
//         </div>
//       </div>
//     </div>
//   </div>
//   );
// };

// export default Profile;






import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams(); 
  const [reviews, setReviews] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectingFavorites, setSelectingFavorites] = useState(false);
  const [availableSketches, setAvailableSketches] = useState([]);
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const navigate = useNavigate();


 // Redirect to members page if viewing own profile without userId
 useEffect(() => {
  if (currentUser?._id && !userId) {
    navigate(`/members/${currentUser._id}`);
  }
}, [currentUser, userId, navigate]);

  // Remove the duplicate useEffect and merge the logic
useEffect(() => {
  const fetchData = async () => {
    try {
      // userId from URL params takes precedence over currentUser._id
      const profileId = userId || currentUser?._id;
      if (!profileId) return;

      console.log('Fetching profile for:', profileId);

      // Fetch user data including favorites
      const userResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/${profileId}`
      );
      setUserData(userResponse.data);
      
      // Only set selectedFavorites if this is the current user's profile
      if (currentUser?._id === profileId) {
        setSelectedFavorites(userResponse.data.favoriteSketchIds || []);
      }

      // Fetch reviews
      const reviewsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/${profileId}/reviews`
      );
      setReviews(reviewsResponse.data.filter(review => review.sketch));

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [userId, currentUser?._id]);

// useEffect(() => {
// if (currentUser && userId && userId !== currentUser._id) {
//   const checkFollowStatus = async () => {
//     const userResponse = await axios.get(
//       `${process.env.REACT_APP_API_URL}/api/users/${currentUser._id}`
//     );
//     setIsFollowing(userResponse.data.following.includes(userId));
//   };
//   checkFollowStatus();
// }
// }, [currentUser, userId]);

useEffect(() => {
  if (currentUser && userId && userId !== currentUser._id) {
    const checkFollowStatus = async () => {
      try {
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/${currentUser._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setIsFollowing(userResponse.data.following?.some(user => user._id === userId));
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
    checkFollowStatus();
  }
}, [currentUser, userId]);

const handleFollow = async () => {
try {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/users/${userId}/follow`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  setIsFollowing(response.data.isFollowing);
} catch (error) {
  console.error('Error following user:', error);
}
};

  // use userId from params or currentUser._id
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const profileId = userId || currentUser?._id;
  //       if (!profileId) return;

  //       // Fetch user data including favorites
  //       const userResponse = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/api/users/${profileId}`
  //       );
  //       setUserData(userResponse.data);
  //       setSelectedFavorites(userResponse.data.favoriteSketchIds || []);

  //       // Fetch reviews
  //       const reviewsResponse = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/api/users/${profileId}/reviews`
  //       );
  //       setReviews(reviewsResponse.data.filter(review => review.sketch));

  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       setError('Failed to load profile data');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [userId, currentUser?._id]);


  // const handleSearch = async (query) => {
  //   try {
  //     if (!query.trim()) {
  //       setSearchResults([]);
  //       return;
  //     }

  //     const response = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/api/sketches?search=${query}`
  //     );
  //     setSearchResults(response.data.sketches);
  //   } catch (error) {
  //     console.error('Error searching sketches:', error);
  //   }
  // };

  const handleSearch = async (query) => {
    try {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
  
      // Remove accents, convert to lowercase, and escape special regex characters
      const normalizedQuery = query
        .normalize('NFD')  // Normalize to decomposed form
        .replace(/[\u0300-\u036f]/g, '')  // Remove accent marks
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // Escape special regex characters
        .toLowerCase();
  
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/sketches`,
        { 
          params: { 
            search: normalizedQuery,
            limit: 10  // Limit search results
          } 
        }
      );
      setSearchResults(response.data.sketches);
    } catch (error) {
      console.error('Error searching sketches:', error);
    }
  };

  const handleFavoriteToggle = (sketch) => {
    setSelectedFavorites(prev => {
      const exists = prev.find(s => s._id === sketch._id);
      if (exists) {
        return prev.filter(s => s._id !== sketch._id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, sketch];
    });
  };

  const isOwnProfile = currentUser?._id === (userId || currentUser?._id);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       if (!currentUser?._id) return;

  //       // Fetch user data including favorites
  //       const userResponse = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/api/users/${currentUser._id}`
  //       );
  //       setUserData(userResponse.data);
  //       setSelectedFavorites(userResponse.data.favoriteSketchIds || []);

  //       // Fetch reviews
  //       const reviewsResponse = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/api/users/${currentUser._id}/reviews`
  //       );
  //       setReviews(reviewsResponse.data.filter(review => review.sketch));

  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       setError('Failed to load profile data');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [currentUser?._id]);

  const handleSelectFavorites = async () => {
    try {
      // Fetch available sketches if not already loaded
      if (!availableSketches.length) {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sketches`);
        setAvailableSketches(response.data.sketches);
      }
      setSelectingFavorites(true);
    } catch (error) {
      console.error('Error fetching sketches:', error);
    }
  };

  // const handleSaveFavorites = async () => {
  //   try {
  //     const response = await axios.put(
  //       `${process.env.REACT_APP_API_URL}/api/users/favorites`,
  //       { favoriteSketchIds: selectedFavorites.map(sketch => sketch._id) },
  //       { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  //     );
  //     setUserData(response.data);
  //     setSelectingFavorites(false);
  //   } catch (error) {
  //     console.error('Error saving favorites:', error);
  //   }
  // };

  const handleSaveFavorites = async () => {
    try {
      console.log('Saving favorites:', selectedFavorites);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/favorites`,
        { 
          favoriteSketchIds: selectedFavorites.map(sketch => sketch._id) 
        },
        { 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        }
      );
      setUserData(response.data);
      setSelectingFavorites(false);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // const handleSaveProfile = async () => {
  //   try {
  //     const response = await axios.put(
  //       `${process.env.REACT_APP_API_URL}/api/users/profile`,
  //       { bio, website },
  //       { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  //     );
  //     setUserData(response.data);
  //     setEditingBio(false);
  //   } catch (error) {
  //     console.error('Error saving profile:', error);
  //   }
  // };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        { 
          bio, 
          website,
          favoriteSketchIds: userData.favoriteSketchIds.map(sketch => sketch._id)
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUserData(response.data);
      setEditingBio(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };
  

  

  if (loading) return <div className="min-h-screen bg-[#14181c] flex items-center justify-center text-[#9ab]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#14181c]">
      {/* Profile Header */}
      {/* <div className="bg-[#2c3440]">
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          <h1 className="text-3xl font-semibold text-white mb-2">
            {userData?.username}
          </h1>
          <p className="text-[#9ab]">{reviews.length} reviews</p>
        </div>
      </div> */}
        {/* Profile Header */}
    <div className="bg-[#2c3440]">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="flex items-start gap-8">
         {/* Profile Avatar */}
           <div className="w-32 h-32 bg-[#14181c] rounded-full flex items-center justify-center">
            <span className="text-4xl text-[#9ab]">
              {/* {currentUser?.username?.charAt(0).toUpperCase()} */}
              {userData?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
   {/* Profile Info */}
             <div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            {/* {currentUser?.username} */}
            {userData?.username}
            </h1>
            <div className="text-[#9ab] space-y-1">
              {/* <p>Member since {new Date(user?.createdAt).toLocaleDateString()}</p> */}
          {/* <p>{reviews.length} reviews</p> */}
          {userData?.bio && <p>{userData.bio}</p>}
  {userData?.website && (
    <a href={userData.website} className="text-[#00c030] hover:text-[#00e054]" target="_blank" rel="noopener noreferrer">
      {userData.website}
    </a>
  )}
  {isOwnProfile && (
    <button onClick={() => setEditingBio(true)} className="text-[#00c030] hover:text-[#00e054]">
      {userData?.bio ? 'Edit Bio' : 'Add Bio'}
    </button>
  )}
   <p>{reviews.length} reviews</p>
{/* </div> */}
           </div>
         </div>
         {currentUser && userId && userId !== currentUser._id && (
  <button
    onClick={handleFollow}
    className={`px-4 py-2 rounded ${
      isFollowing 
        ? 'bg-[#2c3440] text-[#9ab]' 
        : 'bg-[#00c030] text-white'
    }`}
  >
    {isFollowing ? 'Following' : 'Follow'}
  </button>
  
)}

       </div>
     </div>
    </div>

    {/*  bio edit modal */}
{editingBio && (
  <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
    <div className="bg-[#2c3440] rounded-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-bold text-white mb-4">Edit Profile</h2>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={180}
        placeholder="Write a short bio..."
        className="w-full p-2 bg-[#14181c] text-white rounded mb-4"
      />
      {/* <input
        type="url"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="Website URL"
        className="w-full p-2 bg-[#14181c] text-white rounded mb-4"
      /> */}
      <div className="flex justify-end gap-2">
        <button onClick={() => setEditingBio(false)} className="px-4 py-2 text-[#9ab]">
          Cancel
        </button>
        <button onClick={handleSaveProfile} className="px-4 py-2 bg-[#00c030] text-white rounded">
          Save
        </button>
      </div>
    </div>
  </div>
)}

      {/* Favorites Section */}
      {(isOwnProfile || userData?.favoriteSketchIds?.length > 0) && (
  <div className="max-w-[1200px] mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-[#9ab]">FAVORITE SKETCHES</h2>
      {isOwnProfile && (
        <button
          onClick={handleSelectFavorites}
          className="text-[#00c030] hover:text-[#00e054] transition-colors"
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
                {/* <button
                  onClick={handleSelectFavorites}
                  className="text-[#00c030] hover:text-[#00e054] transition-colors"
                >
                  Select Favorites
                </button> */}
              </div>
            )}
          </div>
        )}

      {/* Favorite Selection Modal */}
{isOwnProfile && selectingFavorites && (
  <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
    <div className="bg-[#2c3440] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          Select Favorites ({selectedFavorites.length}/4)
        </h2>
        <button
          onClick={() => setSelectingFavorites(false)}
          className="text-[#9ab] hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Current Favorites */}
      {selectedFavorites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Current Favorites</h3>
          <div className="space-y-2">
            {selectedFavorites.map(sketch => (
              <div 
                key={sketch._id} 
                className="flex items-center justify-between p-4 rounded bg-[#14181c] border border-[#456]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={sketch.thumbnails?.[2]?.url}
                    alt={sketch.title}
                    className="w-20 h-12 object-cover rounded"
                  />
                  <span className="text-[#9ab]">{sketch.title}</span>
                </div>
                <button
                  onClick={() => handleFavoriteToggle(sketch)}
                  className="px-3 py-1 rounded ml-4 bg-[#00c030] text-white hover:bg-[#00e054]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search sketches..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full px-4 py-2 bg-[#14181c] border border-[#456] rounded text-white 
                   placeholder-[#678] focus:outline-none focus:border-[#00c030]"
        />
      </div>

      {/* Search results */}
  <div className="space-y-2 mb-6">
      {searchResults.map(sketch => (
        <div 
          key={sketch._id} 
          className="flex items-center justify-between p-4 rounded bg-[#14181c]"
        >
          <div className="flex items-center gap-4">
            <img
              src={sketch.thumbnails?.[2]?.url}
              alt={sketch.title}
              className="w-20 h-12 object-cover rounded"
            />
            <span className="text-[#9ab]">{sketch.title}</span>
          </div>
          <button
            type="button"
            onClick={() => handleFavoriteToggle(sketch)}
            disabled={selectedFavorites.length >= 4 && !selectedFavorites.some(s => s._id === sketch._id)}
            className={`px-3 py-1 rounded ml-4 
              ${selectedFavorites.some(s => s._id === sketch._id)
                ? 'bg-[#00c030] text-white'
                : 'bg-[#456] text-[#9ab]'}`}
          >
            {selectedFavorites.some(s => s._id === sketch._id) ? 'Selected' : 'Select'}
          </button>
        </div>
      ))}
    </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveFavorites}
          className="px-4 py-2 bg-[#00c030] text-white rounded hover:bg-[#00e054]"
        >
          Save Favorites
        </button>
      </div>
    </div>
  </div>
)}

{/* following section after favorites */}
{userData?.following?.length > 0 && (
  <div className="max-w-[1200px] mx-auto px-4 py-8">
    <h2 className="text-xl font-semibold text-[#9ab] mb-6">FOLLOWING</h2>
    <div className="flex flex-wrap gap-4">
      {userData?.following.map(user => (
        <Link 
          key={user._id}
          to={`/profile/${user._id}`}
          className="flex items-center gap-2 bg-[#2c3440] p-2 rounded hover:bg-[#384250]"
        >
          <div className="w-8 h-8 bg-[#14181c] rounded-full flex items-center justify-center">
          <span className="text-sm text-[#9ab]">{user?.username?.[0]}</span>
          </div>
          <span className="text-[#9ab]">{user.username}</span>
        </Link>
      ))}
    </div>
  </div>
)}

{/* followers if youre logged in  */}
{userData?.followers?.length > 0 && isOwnProfile && (
  <div className="max-w-[1200px] mx-auto px-4 py-8">
    <h2 className="text-xl font-semibold text-[#9ab] mb-6">FOLLOWERS</h2>
    <div className="flex flex-wrap gap-4">
      {userData?.followers.map(user => (
        <Link 
          key={user._id}
          to={`/profile/${user._id}`}
          className="flex items-center gap-2 bg-[#2c3440] p-2 rounded hover:bg-[#384250]"
        >
          <div className="w-8 h-8 bg-[#14181c] rounded-full flex items-center justify-center">
            <span className="text-sm text-[#9ab]">{user?.username?.[0]}</span>
          </div>
          <span className="text-[#9ab]">{user.username}</span>
        </Link>
      ))}
    </div>
  </div>
)}

      {/* Reviews Section */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-[#9ab] mb-6">RECENT REVIEWS</h2>
        {/* Rest of your existing reviews section */}
         {/* Recent Reviews */}
      <div className="mb-12">
        {/* <h2 className="text-2xl font-semibold text-white mb-6">Recent Reviews</h2> */}
        
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
              {/* Start watching and reviewing sketches */}
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div> */}
         {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#2c3440] p-6 rounded-lg">
            <h3 className="text-[#9ab] text-sm font-semibold mb-2">SKETCHES</h3>
            <p className="text-3xl text-white">{reviews.length}</p>
          </div> */}
          
          {/* <div className="bg-[#2c3440] p-6 rounded-lg">
            <h3 className="text-[#9ab] text-sm font-semibold mb-2">LISTS</h3>
            <p className="text-3xl text-white">0</p>
          </div> */}

          {/* <div className="bg-[#2c3440] p-6 rounded-lg">
            <h3 className="text-[#9ab] text-sm font-semibold mb-2">FOLLOWERS</h3>
            <p className="text-3xl text-white">{userData?.followers?.length || 0}</p>
          </div>

          <div className="bg-[#2c3440] p-6 rounded-lg">
            <h3 className="text-[#9ab] text-sm font-semibold mb-2">FOLLOWING</h3>
            <p className="text-3xl text-white">{userData?.following?.length || 0}</p>
          </div>
      </div> */}
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#2c3440] p-6 rounded-lg">
            <h3 className="text-[#9ab] text-sm font-semibold mb-2">SKETCHES</h3>
            <p className="text-3xl text-white">{reviews.length}</p>
          </div>
          
          {/* <div className="bg-[#2c3440] p-6 rounded-lg">
            <h3 className="text-[#9ab] text-sm font-semibold mb-2">LISTS</h3>
            <p className="text-3xl text-white">0</p>
          </div> */}
          <div className="bg-[#2c3440] p-6 rounded-lg">
                <h3 className="text-[#9ab] text-sm font-semibold mb-2">FOLLOWING</h3>
                <p className="text-3xl text-white">{userData?.following?.length || 0}</p>
              </div>

          {isOwnProfile && (
            <>
              <div className="bg-[#2c3440] p-6 rounded-lg">
                <h3 className="text-[#9ab] text-sm font-semibold mb-2">FOLLOWERS</h3>
                <p className="text-3xl text-white">{userData?.followers?.length || 0}</p>
              </div>

           
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;