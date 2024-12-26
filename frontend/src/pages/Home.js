// // src/pages/Home.jsx
// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import axios from 'axios';
// import SketchCard from '../components/SketchCard';

// const Home = () => {
//   const [sketches, setSketches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchParams, setSearchParams] = useSearchParams();
  
//   // Get current search params
//   const currentPage = parseInt(searchParams.get('page')) || 1;
//   const searchQuery = searchParams.get('search') || '';

//   const fetchSketches = async () => {
//     try {
//       setLoading(true);
//       console.log('Fetching sketches with search:', searchQuery);
      
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sketches`, {
//         params: {
//           page: currentPage,
//           search: searchQuery,
//           limit: 12
//         }
//       });

//       console.log('Received sketches:', response.data.sketches.length);
//       setSketches(response.data.sketches);
//       setError('');
//     } catch (error) {
//       console.error('Error fetching sketches:', error);
//       setError('Failed to load sketches');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSketches();
//   }, [currentPage, searchQuery]);

//   const handlePageChange = (newPage) => {
//     setSearchParams(prev => {
//       if (searchQuery) prev.set('search', searchQuery);
//       prev.set('page', newPage.toString());
//       return prev;
//     });
//   };

//   if (loading) {
//     return (
//       <div className="max-w-6xl mx-auto py-8 px-4">
//         <div className="text-center">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto py-8 px-4">
//       {searchQuery && (
//         <div className="mb-6">
//           <h2 className="text-xl font-semibold">
//             Search results for "{searchQuery}"
//           </h2>
//           <button 
//             onClick={() => setSearchParams({})}
//             className="mt-2 text-blue-600 hover:underline"
//           >
//             Clear search
//           </button>
//         </div>
//       )}

//       {error ? (
//         <div className="bg-red-50 text-red-600 p-4 rounded-lg">
//           {error}
//         </div>
//       ) : sketches.length > 0 ? (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {sketches.map(sketch => (
//               <SketchCard key={sketch._id} sketch={sketch} />
//             ))}
//           </div>
          
//           <div className="flex justify-center mt-8 space-x-4">
//             <button
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               Previous
//             </button>
//             <span className="flex items-center">
//               Page {currentPage}
//             </span>
//             <button
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={sketches.length < 12}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               Next
//             </button>
//           </div>
//         </>
//       ) : (
//         <div className="text-center py-8 text-gray-500">
//           No sketches found {searchQuery ? `for "${searchQuery}"` : ''}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;
// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import SketchCard from '../components/SketchCard';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [sketches, setSketches] = useState([]);
  const [featuredSketch, setFeaturedSketch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAuth();
  
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const searchQuery = searchParams.get('search') || '';

  
  const normalizeSearchQuery = (query) => {
    return query
      .normalize('NFD')  // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '')  // Remove accent marks
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // Escape special regex characters
      .toLowerCase();
  };
  
  const fetchSketches = async () => {
    try {
      setLoading(true);
      
      // Normalize the search query
      const normalizedSearchQuery = searchQuery 
        ? normalizeSearchQuery(searchQuery) 
        : '';
  
      console.log('Fetching sketches with normalized search:', normalizedSearchQuery);
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sketches`, {
        params: {
          page: currentPage,
          search: normalizedSearchQuery,
          limit: 12
        }
      });
  
      console.log('Received sketches:', response.data.sketches.length);
      setSketches(response.data.sketches);
      
      // Set featured sketch if we're on the first page and not searching
      if (currentPage === 1 && !normalizedSearchQuery && response.data.sketches.length > 0) {
        setFeaturedSketch(response.data.sketches[1]);
      }
      
      setError('');
    } catch (error) {
      console.error('Error fetching sketches:', error);
      setError('Failed to load sketches');
    } finally {
      setLoading(false);
    }
  };
  
  // const fetchSketches = async () => {
  //   try {
  //     setLoading(true);
  //     console.log('Fetching sketches with search:', searchQuery);
      
  //     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sketches`, {
  //       params: {
  //         page: currentPage,
  //         search: searchQuery,
  //         limit: 12
  //       }
  //     });

  //     console.log('Received sketches:', response.data.sketches.length);
  //     setSketches(response.data.sketches);
      
  //     // Set featured sketch if we're on the first page and not searching
  //     if (currentPage === 1 && !searchQuery && response.data.sketches.length > 0) {
  //       setFeaturedSketch(response.data.sketches[1]);
  //     }
      
  //     setError('');
  //   } catch (error) {
  //     console.error('Error fetching sketches:', error);
  //     setError('Failed to load sketches');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchSketches();
  }, [currentPage, searchQuery]);

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      if (searchQuery) prev.set('search', searchQuery);
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-text-light">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#14181c] min-h-screen">
      {/* Hero Section - Only show on first page with no search */}
      {currentPage === 1 && !searchQuery && featuredSketch && (
        <div className="relative h-[85vh] overflow-hidden">
          {/* Featured Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${
                // Try to get highest quality thumbnail
                // featuredSketch.thumbnails?.[featuredSketch.thumbnails.length - 1]?.url ||
                // featuredSketch.thumbnails?.high
                "https://www.usmagazine.com/wp-content/uploads/2023/12/Emma-Stone-Makes-Herstory-in-SNLs-Five-Timers-Club-Who-Else-is-a-Member-PROMO.jpg?crop=0px%2C94px%2C2000px%2C1051px&resize=1200%2C630&quality=86&strip=all"
              })`,
              backgroundPosition: '50% 20%'
            }}
          >
            {/* Vignette overlay */}
            <div className="absolute inset-0" 
                 style={{
                   background: 'radial-gradient(ellipse at center, rgba(20,24,28,0) 0%, rgba(20,24,28,0.7) 50%, rgba(20,24,28,1) 100%)'
                 }} 
            />
          </div>
          
          {/* Featured content */}
          <div className="relative z-10 h-full max-w-[1200px] mx-auto px-4">
            <div className="flex flex-col justify-end h-full pb-20">
              <h1 className="text-white text-4xl md:text-5xl text-center leading-relaxed">
                Track sketches you've watched.
                <br />
                Save those you want to see.
                <br />
                Tell your friends what's good.
              </h1>
            </div>
            
            {/* Featured sketch title */}
            <div className="absolute -right-12 top-1/2 transform -rotate-90 origin-right">
              <span className="text-[#9ab] opacity-60 hover:opacity-100 transition-opacity">
                {/* {featuredSketch.title} */}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="bg-[#14181c]">
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          {/* Get Started Section */}
          { !searchQuery && !user ? (
          <div className="text-center mb-16">
                {/* <Link
              to="/about"
              className="inline-block bg-[#00c030] hover:bg-[#00e054] px-8 py-3 rounded text-white font-semibold tracking-wide transition-colors"
            >
             ABOUT
            </Link> */}
            <Link
              to="/register"
              className="inline-block bg-[#00c030] hover:bg-[#00e054] px-8 py-3 rounded text-white font-semibold tracking-wide transition-colors"
            >
              GET STARTED
            </Link>
            <p className="mt-6 text-[#9ab]">
              The social network for SNL fans.
            </p>
          </div>) : <div></div>
          }
           { !searchQuery && user ? (
          <div className="text-center mb-16">
                <Link
              to="/about"
              className="inline-block bg-[#00c030] hover:bg-[#00e054] px-8 py-3 rounded text-white font-semibold tracking-wide transition-colors"
            >
             ABOUT
            </Link>
            {/* <Link
              to="/register"
              className="inline-block bg-[#00c030] hover:bg-[#00e054] px-8 py-3 rounded text-white font-semibold tracking-wide transition-colors"
            >
              GET STARTED
            </Link> */}
            <p className="mt-6 text-[#9ab]">
              The social network for SNL fans.
            </p>
          </div>) : <div></div>
          }

          {/* Search Results Header */}
          {searchQuery && (
            <div className="mb-8">
              <h2 className="text-[#fff] text-xl font-semibold mb-2">
                Search results for "{searchQuery}"
              </h2>
              <button 
                onClick={() => setSearchParams({})}
                className="text-[#00c030] hover:text-[#00e054] transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Sketches Grid */}
          {error ? (
            <div className="bg-red-900/20 text-red-400 p-4 rounded">
              {error}
            </div>
          ) : sketches.length > 0 ? (
            <>
              {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sketches.map(sketch => (
                  <SketchCard key={sketch._id} sketch={sketch} />
                ))}
              </div> */}
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
                      {/* <span>{sketch.reviewCount} reviews</span> */}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
              
              {/* Pagination */}
              <div className="flex justify-center items-center space-x-4 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-2 bg-[#2c3440] text-[#9ab] rounded 
                           hover:bg-[#00c030] hover:text-white disabled:opacity-50 
                           disabled:hover:bg-[#2c3440] disabled:hover:text-[#9ab] 
                           transition-colors"
                >
                  Previous
                </button>
                <span className="text-[#9ab]">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={sketches.length < 12}
                  className="px-6 py-2 bg-[#2c3440] text-[#9ab] rounded 
                           hover:bg-[#00c030] hover:text-white disabled:opacity-50 
                           disabled:hover:bg-[#2c3440] disabled:hover:text-[#9ab] 
                           transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#9ab]">
              No sketches found {searchQuery ? `for "${searchQuery}"` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;