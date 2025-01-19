// // // THIS IS THE PAGE FOR LISTS LIKE THE OVERALL /LISTS ROUTE
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Star, Search, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import axios from 'axios';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLists = async (currentPage, currentSort) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lists`, {
        params: { 
          page: currentPage, 
          sortBy: currentSort
        }
      });
      setLists(response.data.lists);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists(page, sortBy);
  }, [page, sortBy]);

  const handleSaveList = async (listId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/lists/${listId}/save`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setLists(prevLists => 
        prevLists.map(list => 
          list._id === listId 
            ? { 
                ...list, 
                isSaved: response.data.saved,
                saveCount: response.data.saveCount 
              } 
            : list
        )
      );
    } catch (error) {
      console.error('Error saving list:', error);
    }
  };

  const filteredLists = lists.filter(list => 
    list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && lists.length === 0) {
    return (
      <div className="min-h-screen bg-[#14181c] flex items-center justify-center">
        <div className="text-[#9ab]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#14181c] px-4 py-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-red-900/20 text-red-400 p-4 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-[#14181c]">
    //   <div className="max-w-[1200px] mx-auto px-4 py-8">
    //     {/* Header Section */}
    //     <div className="mb-6">
    //       <h1 className="text-2xl font-semibold text-[#9ab] mb-4">LISTS</h1>
          
    //       {/* Search and Filter Controls */}
    //       <div className="space-y-4">
    //         {/* Search Bar */}
    //         <div className="relative">
    //           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#678]" size={18} />
    //           <input
    //             type="text"
    //             placeholder="Search lists..."
    //             value={searchTerm}
    //             onChange={(e) => setSearchTerm(e.target.value)}
    //             className="w-full bg-[#2c3440] text-[#9ab] pl-10 pr-4 py-2.5 rounded-lg
    //                      border border-[#456] focus:outline-none focus:border-[#00c030]"
    //           />
    //         </div>
            
    //         {/* Sort Dropdown */}
    //         <select
    //           value={sortBy}
    //           onChange={(e) => {
    //             setSortBy(e.target.value);
    //             setPage(1);
    //           }}
    //           className="w-full sm:w-auto min-w-[140px] bg-[#2c3440] text-[#9ab] px-4 py-2.5 rounded-lg
    //                    border border-[#456] focus:outline-none focus:border-[#00c030]"
    //         >
    //           <option value="newest">Newest First</option>
    //           <option value="oldest">Oldest First</option>
    //           <option value="popular">Most Popular</option>
    //         </select>
    //       </div>
    //     </div>
    <div className="min-h-screen bg-[#14181c]">
  <div className="max-w-[1200px] mx-auto px-4 py-8">
    {/* Header Section */}
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-[#9ab]">LISTS</h1>
      
      {/* Sort Dropdown */}
      <select
        value={sortBy}
        onChange={(e) => {
          setSortBy(e.target.value);
          setPage(1);
        }}
        className="w-auto bg-[#2c3440] text-[#9ab] px-4 py-2.5 rounded-lg
                   border border-[#456] focus:outline-none focus:border-[#00c030]"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="popular">Most Popular</option>
      </select>
    </div>

    {/* Search Bar */}
    <div className="relative mt-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#678]" size={18} />
      <input
        type="text"
        placeholder="Search lists..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-[#2c3440] text-[#9ab] pl-10 pr-4 py-2.5 rounded-lg
                   border border-[#456] focus:outline-none focus:border-[#00c030]"
      />
    </div>

        {/* Lists Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map(list => (
            <Link 
              key={list._id}
              to={`/lists/${list._id}`}
              className="group bg-[#2c3440] rounded-lg overflow-hidden hover:bg-[#384250] transition-colors"
            >
              <div className="relative aspect-video w-full bg-[#1f2937]">
                {list.entries.length > 0 ? (
                  <div className="grid grid-cols-2 gap-0.5 absolute inset-0">
                    {list.entries.slice(0, 4).map((entry) => (
                      <div 
                        key={entry.sketchId._id}
                        className="relative overflow-hidden"
                      >
                        <img
                          src={entry.sketchId.thumbnails?.[2]?.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#9ab]">
                    <Grid size={32} />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium line-clamp-1 group-hover:text-[#00c030] transition-colors">
                    {list.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveList(list._id);
                    }}
                    className="text-[#9ab] hover:text-[#00c030] transition-colors"
                  >
                    {list.isSaved ? (
                      <BookmarkCheck size={18} />
                    ) : (
                      <BookmarkPlus size={18} />
                    )}
                  </button>
                </div>
                
                {list.description && (
                  <p className="text-sm text-[#9ab] line-clamp-2 mb-2">
                    {list.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-sm text-[#678] flex-wrap">
                  <Link
                    to={`/profile/${list.user._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-[#00c030]"
                  >
                    {list.user.username}
                  </Link>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Grid size={14} />
                    <span>{list.entries.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookmarkPlus size={14} />
                    <span>{list.saveCount}</span>
                  </div>
                  {list.isRanked && (
                    <div className="flex items-center gap-1">
                      <Star size={14} />
                      <span>Ranked</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg ${
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
            className={`px-4 py-2 rounded-lg ${
              page === totalPages
                ? 'bg-[#2c3440] text-[#678] cursor-not-allowed'
                : 'bg-[#2c3440] text-[#9ab] hover:bg-[#384250]'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lists;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Grid, Star, Search, BookmarkPlus, BookmarkCheck } from 'lucide-react';
// import axios from 'axios';

// const Lists = () => {
//   const [lists, setLists] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [sortBy, setSortBy] = useState('newest');
//   const [searchTerm, setSearchTerm] = useState('');

//   const fetchLists = async (currentPage, currentSort) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lists`, {
//         params: { 
//           page: currentPage, 
//           sortBy: currentSort
//         }
//       });
//       setLists(response.data.lists);
//       setTotalPages(response.data.totalPages);
//     } catch (error) {
//       setError('Failed to load lists');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLists(page, sortBy);
//   }, [page, sortBy]);

//   const handleSaveList = async (listId) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/api/lists/${listId}/save`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         }
//       );
      
//       setLists(prevLists => 
//         prevLists.map(list => 
//           list._id === listId 
//             ? { 
//                 ...list, 
//                 isSaved: response.data.saved,
//                 saveCount: response.data.saveCount 
//               } 
//             : list
//         )
//       );
//     } catch (error) {
//       console.error('Error saving list:', error);
//     }
//   };

//   // Filter lists based on search term
//   const filteredLists = lists.filter(list => 
//     list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     list.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     list.user.username.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading && lists.length === 0) {
//     return (
//       <div className="min-h-screen bg-[#14181c] flex items-center justify-center">
//         <div className="text-[#9ab]">Loading...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-[#14181c] px-4 py-8">
//         <div className="max-w-[1200px] mx-auto">
//           <div className="bg-red-900/20 text-red-400 p-4 rounded">
//             {error}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#14181c]">
//       <div className="max-w-[1200px] mx-auto px-4 py-8">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
//           <h1 className="text-2xl font-semibold text-[#9ab]">LISTS</h1>
          
//           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
//             {/* <div className="relative flex-grow sm:flex-grow-0">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#678]" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search lists..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full sm:w-64 bg-[#2c3440] text-[#9ab] pl-10 pr-4 py-2 rounded 
//                          border border-[#456] focus:outline-none focus:border-[#00c030]"
//               />
//             </div> */}

//             <select
//               value={sortBy}
//               onChange={(e) => {
//                 setSortBy(e.target.value);
//                 setPage(1);
//               }}
//               className="bg-[#2c3440] text-[#9ab] px-4 py-2 rounded border border-[#456]
//                        focus:outline-none focus:border-[#00c030]"
//             >
//               <option value="newest">Newest First</option>
//               <option value="oldest">Oldest First</option>
//               <option value="popular">Most Popular</option>
//             </select>
//           </div>
//         </div>
//         {/* <div className="relative flex-grow sm:flex-grow-0"> */}
//         <div className="relative max-w-sm mb-8">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#678]" size={18} />
//           <input
//             type="text"
//             placeholder="Search lists..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full bg-[#2c3440] text-[#9ab] pl-10 pr-4 py-2 rounded 
//                      border border-[#456] focus:outline-none focus:border-[#00c030]"
//           />
//         </div>
//               {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#678]" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search lists..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full sm:w-64 bg-[#2c3440] text-[#9ab] pl-10 pr-4 py-2 rounded 
//                          border border-[#456] focus:outline-none focus:border-[#00c030]"
//               />
//             </div> */}

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredLists.map(list => (
//             <Link 
//               key={list._id}
//               to={`/lists/${list._id}`}
//               className="group bg-[#2c3440] rounded overflow-hidden hover:bg-[#384250] transition-colors"
//             >
//               <div className="relative aspect-video w-full bg-[#1f2937]">
//                 {list.entries.length > 0 ? (
//                   <div className="grid grid-cols-2 gap-0.5 absolute inset-0">
//                     {list.entries.slice(0, 4).map((entry, index) => (
//                       <div 
//                         key={entry.sketchId._id}
//                         className="relative overflow-hidden"
//                       >
//                         <img
//                           src={entry.sketchId.thumbnails?.[2]?.url}
//                           alt=""
//                           className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center h-full text-[#9ab]">
//                     <Grid size={32} />
//                   </div>
//                 )}
//               </div>

//               <div className="p-4">
//                 <div className="flex justify-between items-start mb-2">
//                   <h3 className="text-white font-medium line-clamp-1 group-hover:text-[#00c030] transition-colors">
//                     {list.title}
//                   </h3>
//                   <button
//                     onClick={(e) => {
//                       e.preventDefault();
//                       handleSaveList(list._id);
//                     }}
//                     className="text-[#9ab] hover:text-[#00c030] transition-colors"
//                   >
//                     {list.isSaved ? (
//                       <BookmarkCheck size={18} />
//                     ) : (
//                       <BookmarkPlus size={18} />
//                     )}
//                   </button>
//                 </div>
                
//                 {list.description && (
//                   <p className="text-sm text-[#9ab] line-clamp-2 mb-2">
//                     {list.description}
//                   </p>
//                 )}

//                 <div className="flex items-center gap-3 text-sm text-[#678]">
//                   <Link
//                     to={`/profile/${list.user._id}`}
//                     onClick={(e) => e.stopPropagation()}
//                     className="hover:text-[#00c030]"
//                   >
//                     {list.user.username}
//                   </Link>
//                   <span>•</span>
//                   <div className="flex items-center gap-1">
//                     <Grid size={14} />
//                     <span>{list.entries.length}</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <BookmarkPlus size={14} />
//                     <span>{list.saveCount}</span>
//                   </div>
//                   {list.isRanked && (
//                     <div className="flex items-center gap-1">
//                       <Star size={14} />
//                       <span>Ranked</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {/* Pagination */}
//         <div className="flex justify-center mt-8 space-x-4">
//           <button
//             onClick={() => setPage(p => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className={`px-4 py-2 rounded ${
//               page === 1
//                 ? 'bg-[#2c3440] text-[#678] cursor-not-allowed'
//                 : 'bg-[#2c3440] text-[#9ab] hover:bg-[#384250]'
//             }`}
//           >
//             Previous
//           </button>
//           <span className="flex items-center text-[#9ab]">
//             Page {page} of {totalPages}
//           </span>
//           <button
//             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//             disabled={page === totalPages}
//             className={`px-4 py-2 rounded ${
//               page === totalPages
//                 ? 'bg-[#2c3440] text-[#678] cursor-not-allowed'
//                 : 'bg-[#2c3440] text-[#9ab] hover:bg-[#384250]'
//             }`}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Lists;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Grid, Star, Search, BookmarkPlus, BookmarkCheck } from 'lucide-react';
// import axios from 'axios';
// import debounce from 'lodash/debounce';

// const Lists = () => {
//   const [lists, setLists] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [sortBy, setSortBy] = useState('newest');
//   const [searchTerm, setSearchTerm] = useState('');

//   const debouncedFetch = debounce((search) => {
//     setPage(1);
//     fetchLists(1, sortBy, search);
//   }, 300);

//   const fetchLists = async (currentPage, currentSort, search) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lists`, {
//         params: { 
//           page: currentPage, 
//           sortBy: currentSort,
//           search,
//         }
//       });
//       setLists(response.data.lists);
//       setTotalPages(response.data.totalPages);
//     } catch (error) {
//       setError('Failed to load lists');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLists(page, sortBy, searchTerm);
//   }, [page, sortBy]);

//   const handleSearch = (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);
//     debouncedFetch(value);
//   };

//   const handleSaveList = async (listId) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/api/lists/${listId}/save`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         }
//       );
      
//       setLists(prevLists => 
//         prevLists.map(list => 
//           list._id === listId 
//             ? { 
//                 ...list, 
//                 isSaved: response.data.saved,
//                 saveCount: response.data.saveCount 
//               } 
//             : list
//         )
//       );
//     } catch (error) {
//       console.error('Error saving list:', error);
//     }
//   };

//   if (loading && lists.length === 0) {
//     return (
//       <div className="min-h-screen bg-[#14181c] flex items-center justify-center">
//         <div className="text-[#9ab]">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#14181c]">
//       <div className="max-w-[1200px] mx-auto px-4 py-8">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
//           <h1 className="text-2xl font-semibold text-[#9ab]">LISTS</h1>
          
//           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
//             <div className="relative flex-grow sm:flex-grow-0">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#678]" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search lists..."
//                 value={searchTerm}
//                 onChange={handleSearch}
//                 className="w-full sm:w-64 bg-[#2c3440] text-[#9ab] pl-10 pr-4 py-2 rounded 
//                          border border-[#456] focus:outline-none focus:border-[#00c030]"
//               />
//             </div>

//             <select
//               value={sortBy}
//               onChange={(e) => {
//                 setSortBy(e.target.value);
//                 setPage(1);
//               }}
//               className="bg-[#2c3440] text-[#9ab] px-4 py-2 rounded border border-[#456]
//                        focus:outline-none focus:border-[#00c030]"
//             >
//               <option value="newest">Newest First</option>
//               <option value="oldest">Oldest First</option>
//               <option value="popular">Most Popular</option>
//             </select>
//           </div>
//         </div>

//         {error ? (
//           <div className="bg-red-900/20 text-red-400 p-4 rounded">
//             {error}
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {lists.map(list => (
//                 <Link 
//                   key={list._id}
//                   to={`/lists/${list._id}`}
//                   className="group bg-[#2c3440] rounded overflow-hidden hover:bg-[#384250] transition-colors"
//                 >
//                   <div className="relative aspect-video w-full bg-[#1f2937]">
//                     {list.entries.length > 0 ? (
//                       <div className="grid grid-cols-2 gap-0.5 absolute inset-0">
//                         {list.entries.slice(0, 4).map((entry, index) => (
//                           <div 
//                             key={entry.sketchId._id}
//                             className="relative overflow-hidden"
//                           >
//                             <img
//                               src={entry.sketchId.thumbnails?.[2]?.url}
//                               alt=""
//                               className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="flex items-center justify-center h-full text-[#9ab]">
//                         <Grid size={32} />
//                       </div>
//                     )}
//                   </div>

//                   <div className="p-4">
//                     <div className="flex justify-between items-start mb-2">
//                       <h3 className="text-white font-medium line-clamp-1 group-hover:text-[#00c030] transition-colors">
//                         {list.title}
//                       </h3>
//                       <button
//                         onClick={(e) => {
//                           e.preventDefault();
//                           handleSaveList(list._id);
//                         }}
//                         className="text-[#9ab] hover:text-[#00c030] transition-colors"
//                       >
//                         {list.isSaved ? (
//                           <BookmarkCheck size={18} />
//                         ) : (
//                           <BookmarkPlus size={18} />
//                         )}
//                       </button>
//                     </div>
                    
//                     {list.description && (
//                       <p className="text-sm text-[#9ab] line-clamp-2 mb-2">
//                         {list.description}
//                       </p>
//                     )}

//                     <div className="flex items-center gap-3 text-sm text-[#678]">
//                       <Link
//                         to={`/profile/${list.user._id}`}
//                         onClick={(e) => e.stopPropagation()}
//                         className="hover:text-[#00c030]"
//                       >
//                         {list.user.username}
//                       </Link>
//                       <span>•</span>
//                       <div className="flex items-center gap-1">
//                         <Grid size={14} />
//                         <span>{list.entries.length}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <BookmarkPlus size={14} />
//                         <span>{list.saveCount}</span>
//                       </div>
//                       {list.isRanked && (
//                         <div className="flex items-center gap-1">
//                           <Star size={14} />
//                           <span>Ranked</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>

//             {/* Pagination */}
//             <div className="flex justify-center mt-8 space-x-4">
//               <button
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className={`px-4 py-2 rounded ${
//                   page === 1
//                     ? 'bg-[#2c3440] text-[#678] cursor-not-allowed'
//                     : 'bg-[#2c3440] text-[#9ab] hover:bg-[#384250]'
//                 }`}
//               >
//                 Previous
//               </button>
//               <span className="flex items-center text-[#9ab]">
//                 Page {page} of {totalPages}
//               </span>
//               <button
//                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 className={`px-4 py-2 rounded ${
//                   page === totalPages
//                     ? 'bg-[#2c3440] text-[#678] cursor-not-allowed'
//                     : 'bg-[#2c3440] text-[#9ab] hover:bg-[#384250]'
//                 }`}
//               >
//                 Next
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Lists;

// // import React, { useState, useEffect } from 'react';
// // import { Link } from 'react-router-dom';
// // import { Heart, Search } from 'lucide-react';
// // import axios from 'axios';
// // import { useAuth } from '../context/AuthContext';

// // const Lists = () => {
// //   const [lists, setLists] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');
// //   const [sortBy, setSortBy] = useState('popular'); // popular, recent
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const { user } = useAuth();

// //   useEffect(() => {
// //     const fetchLists = async () => {
// //       try {
// //         const response = await axios.get(
// //           `${process.env.REACT_APP_API_URL}/api/lists`,
// //           { 
// //             params: { 
// //               sort: sortBy,
// //               search: searchQuery
// //             }
// //           }
// //         );
// //         setLists(response.data);
// //       } catch (error) {
// //         setError('Failed to load lists');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchLists();
// //   }, [sortBy, searchQuery]);

// //   const handleLikeList = async (listId) => {
// //     if (!user) return; // Handle not logged in

// //     try {
// //       const response = await axios.post(
// //         `${process.env.REACT_APP_API_URL}/api/lists/${listId}/like`,
// //         {},
// //         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
// //       );

// //       setLists(prev => prev.map(list => {
// //         if (list._id === listId) {
// //           const isLiked = response.data.isLiked;
// //           return {
// //             ...list,
// //             likes: isLiked 
// //               ? [...list.likes, user._id]
// //               : list.likes.filter(id => id !== user._id)
// //           };
// //         }
// //         return list;
// //       }));
// //     } catch (error) {
// //       console.error('Error liking list:', error);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-[#14181c] flex items-center justify-center">
// //         <div className="text-[#9ab]">Loading lists...</div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-[#14181c] pt-[72px]">
// //       <div className="max-w-[1200px] mx-auto px-4 py-8">
// //         <div className="flex flex-col gap-6">
// //           {/* Header */}
// //           <div className="flex justify-between items-center">
// //             <h1 className="text-2xl font-semibold text-[#9ab]">LISTS</h1>
// //             <select
// //               value={sortBy}
// //               onChange={(e) => setSortBy(e.target.value)}
// //               className="bg-[#2c3440] text-[#9ab] p-2 rounded"
// //             >
// //               <option value="popular">Popular</option>
// //               <option value="recent">Recent</option>
// //             </select>
// //           </div>

// //           {/* Search */}
// //           <div className="relative">
// //             <input
// //               type="text"
// //               placeholder="Search lists..."
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //               className="w-full bg-[#2c3440] text-white px-4 py-2 pl-10 rounded focus:outline-none focus:ring-2 focus:ring-[#00e054] placeholder-[#9ab]"
// //             />
// //             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab]" size={16} />
// //           </div>

// //           {/* Lists Grid */}
// //           {error ? (
// //             <div className="bg-red-900/20 text-red-400 p-4 rounded">
// //               {error}
// //             </div>
// //           ) : lists.length > 0 ? (
// //             <div className="grid gap-6">
// //               {lists.map(list => (
// //                 <div 
// //                   key={list._id}
// //                   className="bg-[#2c3440] rounded-lg overflow-hidden hover:bg-[#384250] transition-colors"
// //                 >
// //                   <Link to={`/lists/${list._id}`} className="block p-6">
// //                     <div className="flex justify-between items-start">
// //                       <div className="flex-grow">
// //                         <div className="flex items-center gap-4 mb-2">
// //                           <Link 
// //                             to={`/members/${list.user._id}`}
// //                             className="text-[#9ab] hover:text-[#fff]"
// //                             onClick={(e) => e.stopPropagation()}
// //                           >
// //                             {list.user.username}
// //                           </Link>
// //                           <span className="text-[#678]">•</span>
// //                           <button
// //                             onClick={(e) => {
// //                               e.preventDefault();
// //                               e.stopPropagation();
// //                               handleLikeList(list._id);
// //                             }}
// //                             className={`flex items-center gap-1 ${
// //                               list.likes.includes(user?._id)
// //                                 ? 'text-[#ff6b6b]'
// //                                 : 'text-[#9ab] hover:text-[#ff6b6b]'
// //                             }`}
// //                           >
// //                             <Heart
// //                               size={16}
// //                               className={list.likes.includes(user?._id) ? 'fill-current' : ''}
// //                             />
// //                             <span>{list.likes.length}</span>
// //                           </button>
// //                         </div>

// //                         <h2 className="text-xl text-white font-semibold mb-2">
// //                           {list.title}
// //                         </h2>

// //                         {list.description && (
// //                           <p className="text-[#9ab] mb-4 line-clamp-2">
// //                             {list.description}
// //                           </p>
// //                         )}

// //                         <p className="text-sm text-[#678]">
// //                           {list.sketches.length} sketches
// //                         </p>
// //                       </div>

// //                       {/* Thumbnails Preview */}
// //                       {list.sketches.length > 0 && (
// //                         <div className="flex -space-x-2 ml-4">
// //                           {list.sketches.slice(0, 3).map(sketch => (
// //                             <img
// //                               key={sketch._id}
// //                               src={sketch.thumbnails?.[0]?.url}
// //                               alt={sketch.title}
// //                               className="w-16 h-10 object-cover rounded border border-[#14181c]"
// //                             />
// //                           ))}
// //                         </div>
// //                       )}
// //                     </div>
// //                   </Link>
// //                 </div>
// //               ))}
// //             </div>
// //           ) : (
// //             <div className="text-center py-12">
// //               <p className="text-[#9ab]">
// //                 {searchQuery 
// //                   ? `No lists found matching "${searchQuery}"`
// //                   : 'No lists found'}
// //               </p>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Lists;