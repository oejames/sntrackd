// // components/ListPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { Star, Edit, Trash2 } from 'lucide-react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import EditListModal from '../components/EditListModal';

// const ListPage = () => {
//   const { listId } = useParams();
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [list, setList] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showEditModal, setShowEditModal] = useState(false);

//   useEffect(() => {
//     const fetchList = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lists/${listId}`);
//         setList(response.data);
//       } catch (error) {
//         setError('Failed to load list');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchList();
//   }, [listId]);

//   const handleDelete = async () => {
//     if (!window.confirm('Are you sure you want to delete this list?')) return;

//     try {
//       await axios.delete(
//         `${process.env.REACT_APP_API_URL}/api/lists/${listId}`,
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       navigate(`/profile/${list.user._id}`);
//     } catch (error) {
//       alert('Failed to delete list');
//     }
//   };

//   if (loading) return (
//     <div className="min-h-screen bg-[#14181c] flex items-center justify-center text-[#9ab]">
//       Loading...
//     </div>
//   );

//   if (error) return (
//     <div className="min-h-screen bg-[#14181c] p-4">
//       <div className="max-w-[1200px] mx-auto">
//         <div className="bg-red-900/20 text-red-400 p-4 rounded">
//           {error}
//         </div>
//       </div>
//     </div>
//   );

//   const isOwner = user?._id === list?.user._id;

//   return (
//         <div className="min-h-screen bg-[#14181c]">
//           {/* Hero Header with background image from first sketch */}
//           <div className="relative pt-[72px]">
//             {/* Gradient Overlay */}
//             <div 
//               className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#14181c]/95 to-[#14181c]"
//               style={{
//                 backgroundImage: list.entries.length > 0 
//                   ? `url(${list.entries[0].sketchId.thumbnails?.[0]?.url})`
//                   : undefined,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 filter: 'blur(8px)',
//                 transform: 'scale(1.1)', // Prevent blur edges
//               }}
//             />
      
//             {/* Content */}
//             <div className="relative max-w-[1200px] mx-auto px-4 py-12">
//               <div className="flex gap-8">
//                 {/* List Preview (first 4 entries in 2x2 grid) */}
//                 {list.entries.length > 0 && (
//                   <div className="w-64 h-64 flex-shrink-0 hidden md:block">
//                     <div className="grid grid-cols-2 gap-2 bg-[#2c3440] p-2 rounded">
//                       {list.entries.slice(0, 4).map(entry => (
//                         <div key={entry.sketchId._id} className="aspect-video">
//                           <img
//                             src={entry.sketchId.thumbnails?.[0]?.url}
//                             alt=""
//                             className="w-full h-full object-cover rounded"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
      
//                 {/* List Info */}
//                 <div className="flex-grow">
//                   <div className="flex items-center gap-4 mb-4 text-lg">
//                     <Link 
//                       to={`/profile/${list.user._id}`} 
//                       className="text-white hover:text-[#00c030]"
//                     >
//                       {list.user.username}
//                     </Link>
//                     {isOwner && (
//                       <div className="flex items-center gap-3">
//                         <button 
//                           onClick={() => setShowEditModal(true)}
//                           className="text-[#9ab] hover:text-[#00c030] flex items-center gap-1"
//                         >
//                           <Edit size={18} />
//                           <span>Edit</span>
//                         </button>
//                         <button 
//                           onClick={handleDelete}
//                           className="text-[#9ab] hover:text-red-500 flex items-center gap-1"
//                         >
//                           <Trash2 size={18} />
//                           <span>Delete</span>
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                   <h1 className="text-4xl font-bold text-white mb-4">{list.title}</h1>
//                   {list.description && (
//                     <p className="text-lg text-[#9ab] mb-6 max-w-2xl">{list.description}</p>
//                   )}
//                   <div className="flex items-center gap-4 text-[#9ab]">
//                     <div>{list.entries.length} sketches</div>
//                     {list.isRanked && (
//                       <div className="flex items-center gap-1">
//                         <span>•</span>
//                         <span>Ranked</span>
//                       </div>
//                     )}
//                     <div className="flex items-center gap-1">
//                       <span>•</span>
//                       <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
      
//           {/* Entries Grid */}
//           <div className="max-w-[1200px] mx-auto px-4 py-8">
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//               {list.entries.map((entry, index) => (
//                 <div key={entry.sketchId._id} className="space-y-2">
//                   <Link
//                     to={`/sketch/${entry.sketchId._id}`}
//                     className="block group relative"
//                   >
//                     {/* Thumbnail */}
//                     <div className="aspect-video bg-[#2c3440] rounded-lg overflow-hidden">
//                       <img
//                         src={entry.sketchId.thumbnails?.[0]?.url}
//                         alt={entry.sketchId.title}
//                         className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
//                       />
//                       {list.isRanked && (
//                         <div className="absolute top-2 left-2 bg-black/75 text-white px-2 py-1 rounded text-sm font-medium">
//                           #{index + 1}
//                         </div>
//                       )}
//                     </div>
//                   </Link>
//                   {/* Title and Notes below thumbnail */}
//                   <div className="px-1">
//                     <h3 className="text-white font-medium line-clamp-1 group-hover:text-[#00c030]">
//                       {entry.sketchId.title}
//                     </h3>
//                     {entry.notes && (
//                       <p className="text-sm text-[#9ab] line-clamp-2 mt-1">
//                         {entry.notes}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
      
//           {showEditModal && (
//             <EditListModal 
//               list={list}
//               onClose={() => setShowEditModal(false)}
//               onListUpdated={setList}
//             />
//           )}
//         </div>
//       );
// //     <div className="min-h-screen bg-[#14181c] pt-[72px]">
// //       <div className="bg-[#2c3440]">
// //         <div className="max-w-[1200px] mx-auto px-4 py-8">
// //           <div className="flex justify-between items-start">
// //             <div>
// //               <div className="flex items-center gap-4 mb-2">
// //                 <Link 
// //                   to={`/profile/${list.user._id}`} 
// //                   className="text-[#9ab] hover:text-[#fff]"
// //                 >
// //                   {list.user.username}
// //                 </Link>
// //                 {isOwner && (
// //                   <div className="flex items-center gap-2">
// //                     <button 
// //                       onClick={() => setShowEditModal(true)}
// //                       className="text-[#9ab] hover:text-[#00c030]"
// //                     >
// //                       <Edit size={16} />
// //                     </button>
// //                     <button 
// //                       onClick={handleDelete}
// //                       className="text-[#9ab] hover:text-red-500"
// //                     >
// //                       <Trash2 size={16} />
// //                     </button>
// //                   </div>
// //                 )}
// //               </div>
// //               <h1 className="text-3xl font-semibold text-white mb-4">{list.title}</h1>
// //               {list.description && (
// //                 <p className="text-[#9ab] mb-4">{list.description}</p>
// //               )}
// //               <div className="text-[#678]">
// //                 {list.entries.length} sketches • {list.isRanked ? 'Ranked' : 'Unranked'}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="max-w-[1200px] mx-auto px-4 py-8">
// //   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
// //     {list.entries.map((entry, index) => (
// //       <Link
// //         key={entry.sketchId._id}
// //         to={`/sketch/${entry.sketchId._id}`}
// //         className="group relative bg-[#2c3440] rounded-lg overflow-hidden"
// //       >
// //         {/* Thumbnail */}
// //         <div className="aspect-video w-full">
// //           <img
// //             src={entry.sketchId.thumbnails?.[2]?.url}
// //             alt={entry.sketchId.title}
// //             className="w-full h-full object-cover"
// //           />
// //           {/* Overlay */}
// //           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
// //             {/* Top section with rank if ranked */}
// //             {list.isRanked && (
// //               <div className="text-lg font-medium text-white">
// //                 #{index + 1}
// //               </div>
// //             )}
// //             {/* Bottom section with title and notes */}
// //             <div>
// //               <h3 className="text-white font-medium line-clamp-2 mb-1">
// //                 {entry.sketchId.title}
// //               </h3>
// //               {entry.notes && (
// //                 <p className="text-sm text-[#9ab] line-clamp-2">
// //                   {entry.notes}
// //                 </p>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </Link>
// //     ))}
// //   </div>
// // </div>

// //       {showEditModal && (
// //         <EditListModal 
// //           list={list}
// //           onClose={() => setShowEditModal(false)}
// //           onListUpdated={setList}
// //         />
// //       )}
// //     </div>
// //   );
// // };
// }

// export default ListPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Edit, Trash2, Clock, Grid, Bookmark } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EditListModal from '../components/EditListModal';
import UserAvatar from '../components/UseAvatar';

const ListPage = () => {
  const { listId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);

//     useEffect(() => {
//     const fetchList = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lists/${listId}`);
//         setList(response.data);
//       } catch (error) {
//         setError('Failed to load list');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchList();
//   }, [listId]);
useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/lists/${listId}`,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            }
          }
        );
        setList(response.data);
        setIsSaved(response.data.isSaved);
        setSaveCount(response.data.saveCount);
      } catch (error) {
        setError('Failed to load list');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [listId]);

  const handleSave = async () => {
    if (!user) {
      // Handle unauthenticated user - maybe redirect to login
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/lists/${listId}/save`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setIsSaved(response.data.saved);
      setSaveCount(response.data.saveCount);
    } catch (error) {
      console.error('Error saving list:', error);
    }
  };


  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/lists/${listId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate(`/profile/${list.user._id}`);
    } catch (error) {
      alert('Failed to delete list');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#14181c] flex items-center justify-center text-[#9ab]">
      Loading...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#14181c] p-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-red-900/20 text-red-400 p-4 rounded">
          {error}
        </div>
      </div>
    </div>
  );

  const isOwner = user?._id === list?.user._id;

  return (
    <div className="min-h-screen bg-[#14181c]">
      {/* Hero Header */}
      <div className="relative h-[400px]">
        {/* Background Image with Gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: list.entries.length > 0 
              ? `url(${list.entries[0].sketchId.thumbnails?.[2]?.url})`
              : undefined,
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-[#14181c]/95 to-[#14181c]" />
        </div>

        {/* Content Container */}
        <div className="relative h-full max-w-[1200px] mx-auto px-6">
          <div className="pt-24 h-full flex items-center">
            <div className="flex gap-8 items-start w-full">
              {/* List Preview */}


              {/* List Info */}
              <div className="flex-grow">
                {/* User and Actions Row */}
                <div className="flex items-center justify-between mb-6">
                  <Link 
                    to={`/profile/${list.user._id}`}
                    className="flex items-center gap-2 text-lg text-white hover:text-[#00c030] transition-colors"
                  >
                 <UserAvatar user={list.user} size="small" />
                    <span>{list.user.username}</span>
                  </Link>
                  {!isOwner && user && (
  <button 
    onClick={handleSave}
    className={`flex items-center gap-2 px-4 py-2 rounded ${
      isSaved 
        ? 'bg-[#00c030] text-white' 
        : 'bg-[#2c3440] text-[#9ab] hover:text-[#00c030]'
    } transition-colors`}
  >
    <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
    <span>{saveCount}</span>
  </button>
)}

                  {isOwner && (
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded bg-[#2c3440] text-[#9ab] hover:text-[#00c030] transition-colors"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 rounded bg-[#2c3440] text-[#9ab] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Title and Description */}
                <h1 className="text-4xl font-bold text-white mb-4">{list.title}</h1>
                {list.description && (
                  <p className="text-lg text-[#9ab] mb-6 max-w-2xl leading-relaxed">
                    {list.description}
                  </p>
                )}

                {/* List Stats */}
                <div className="flex items-center gap-4 text-[#9ab]">
                  <div className="flex items-center gap-2">
                    <Grid size={16} />
                    <span>{list.entries.length} sketches</span>
                  </div>
                  {list.isRanked && (
                    <div className="flex items-center gap-2">
                      <Star size={16} />
                      <span>Ranked</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keep existing Entries Grid section */}
       {/* Entries Grid */}
       <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {list.entries.map((entry, index) => (
                <div key={entry.sketchId._id} className="space-y-2">
                  <Link
                    to={`/sketch/${entry.sketchId._id}`}
                    className="block group relative"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-[#2c3440] rounded-lg overflow-hidden">
                      <img
                        src={entry.sketchId.thumbnails?.[2]?.url}
                        alt={entry.sketchId.title}
                        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      />
                      {list.isRanked && (
                        <div className="absolute top-2 left-2 bg-black/75 text-white px-2 py-1 rounded text-sm font-medium">
                          #{index + 1}
                        </div>
                      )}
                    </div>
                  </Link>
                  {/* Title and Notes below thumbnail */}
                  <div className="px-1">
                    <h3 className="text-white font-medium line-clamp-1 group-hover:text-[#00c030]">
                      {entry.sketchId.title}
                    </h3>
                    {entry.notes && (
                      <p className="text-sm text-[#9ab]  mt-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
      
 
      {showEditModal && (
        <EditListModal 
          list={list}
          onClose={() => setShowEditModal(false)}
          onListUpdated={setList}
        />
      )}


    </div>
  );
};

export default ListPage;