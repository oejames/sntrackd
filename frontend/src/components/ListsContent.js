import { useState, useEffect } from "react";
import axios from "axios";
import CreateListModal from "./CreateListModal";
import { X, Grid, Star } from 'lucide-react';
import { Link } from "react-router-dom";

const ListsContent = ({ userData, isOwnProfile }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userLists, setUserLists] = useState([]);
    const [savedLists, setSavedLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('created');
    
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const [createdResponse, savedResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userData._id}/lists`),
                    axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userData._id}/saved-lists`)
                ]);
                
                setUserLists(createdResponse.data);
                setSavedLists(savedResponse.data);
            } catch (error) {
                console.error('Error fetching lists:', error);
                setError('Failed to load lists');
            } finally {
                setLoading(false);
            }
        };
        
        fetchLists();
    }, [userData._id]);

    const handleDeleteList = async (listId, e) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this list?')) {
            return;
        }
        
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/lists/${listId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            
            setUserLists(prev => prev.filter(list => list._id !== listId));
        } catch (error) {
            console.error('Error deleting list:', error);
            alert('Failed to delete list');
        }
    };

    const renderThumbnails = (entries) => {
        if (entries.length === 0) {
            return (
                <div className="flex items-center justify-center h-full text-[#9ab]">
                    <Grid size={32} />
                </div>
            );
        }

        const gridConfig = {
            1: "grid-cols-1",
            2: "grid-cols-2",
            3: "grid-cols-2",
            4: "grid-cols-2"
        };

        return (
            <div className={`grid ${gridConfig[Math.min(entries.length, 4)]} gap-0.5 absolute inset-0`}>
                {entries.slice(0, 4).map((entry, index) => (
                    <div 
                        key={entry.sketchId._id}
                        className={`relative overflow-hidden ${
                            entries.length === 3 && index === 2 ? "col-span-2" : ""
                        }`}
                    >
                        <img
                            src={entry.sketchId.thumbnails?.[2]?.url}
                            alt=""
                            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-8">
                <div className="text-[#9ab]">Loading lists...</div>
            </div>
        );
    }

    const currentLists = activeTab === 'created' ? userLists : savedLists;

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-6">
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`pb-2 border-b-2 ${
                            activeTab === 'created'
                                ? 'border-[#00c030] text-white'
                                : 'border-transparent text-[#9ab] hover:text-white'
                        }`}
                    >
                        Created
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`pb-2 border-b-2 ${
                            activeTab === 'saved'
                                ? 'border-[#00c030] text-white'
                                : 'border-transparent text-[#9ab] hover:text-white'
                        }`}
                    >
                        Saved
                    </button>
                </div>
                {isOwnProfile && activeTab === 'created' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-[#00c030] hover:text-[#00e054]"
                    >
                        Create a list
                    </button>
                )}
            </div>

            {error ? (
                <div className="text-red-500 bg-red-500/10 p-4 rounded">
                    {error}
                </div>
            ) : currentLists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentLists.map(list => (
                        <Link 
                            key={list._id}
                            to={`/lists/${list._id}`}
                            className="group bg-[#2c3440] rounded overflow-hidden hover:bg-[#384250] transition-colors"
                        >
                            <div className="relative aspect-video w-full bg-[#1f2937]">
                                {renderThumbnails(list.entries)}
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-white font-medium line-clamp-1 group-hover:text-[#00c030] transition-colors">
                                        {list.title}
                                    </h3>
                                    {isOwnProfile && activeTab === 'created' && (
                                        <button
                                            onClick={(e) => handleDeleteList(list._id, e)}
                                            className="text-[#9ab] hover:text-red-500 ml-2"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                
                                {list.description && (
                                    <p className="text-sm text-[#9ab] line-clamp-2 mb-2">
                                        {list.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-3 text-sm text-[#678]">
                                    <div className="flex items-center gap-1">
                                        <Grid size={14} />
                                        <span>{list.entries.length}</span>
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
            ) : (
                <div className="text-center py-12">
                    <p className="text-[#9ab]">
                        {isOwnProfile 
                            ? activeTab === 'created'
                                ? "You haven't created any lists yet"
                                : "You haven't saved any lists yet"
                            : `${userData.username} hasn't ${activeTab === 'created' ? 'created' : 'saved'} any lists yet`}
                    </p>
                </div>
            )}

            {showCreateModal && (
                <CreateListModal
                    onClose={() => setShowCreateModal(false)}
                    onListCreated={(newList) => {
                        setUserLists(prev => [newList, ...prev]);
                        setShowCreateModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ListsContent;
// import { useState, useEffect } from "react";
// import axios from "axios";
// import CreateListModal from "./CreateListModal";
// import { X, Grid, Star } from 'lucide-react';
// import { Link } from "react-router-dom";

// const ListsContent = ({ userData, isOwnProfile }) => {
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [userLists, setUserLists] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//  const [activeTab, setActiveTab] = useState('created');
// const [savedLists, setSavedLists] = useState([]);
  
//     useEffect(() => {
//     //   const fetchLists = async () => {
//     //     try {
//     //       const response = await axios.get(
//     //         `${process.env.REACT_APP_API_URL}/api/users/${userData._id}/lists`
//     //       );
//     //       setUserLists(response.data);
//     const fetchLists = async () => {
//            try {
//              const [createdResponse, savedResponse] = await Promise.all([
//                axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userData._id}/lists`),
//                axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userData._id}/saved-lists`)
//          ]);
             
//              setUserLists(createdResponse.data);
//              setSavedLists(savedResponse.data);
//         } catch (error) {
//           console.error('Error fetching lists:', error);
//           setError('Failed to load lists');
//         } finally {
//           setLoading(false);
//         }
//       };
  
//       fetchLists();
//     }, [userData._id]);
  
//     const handleDeleteList = async (listId, e) => {
//       e.preventDefault();
//       if (!window.confirm('Are you sure you want to delete this list?')) {
//         return;
//       }
  
//       try {
//         await axios.delete(
//           `${process.env.REACT_APP_API_URL}/api/lists/${listId}`,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );
  
//         setUserLists(prev => prev.filter(list => list._id !== listId));
//       } catch (error) {
//         console.error('Error deleting list:', error);
//         alert('Failed to delete list');
//       }
//     };

//     const renderThumbnails = (entries) => {
//       if (entries.length === 0) {
//         return (
//           <div className="flex items-center justify-center h-full text-[#9ab]">
//             <Grid size={32} />
//           </div>
//         );
//       }

//       const gridConfig = {
//         1: "grid-cols-1",
//         2: "grid-cols-2",
//         3: "grid-cols-2", // 2x2 grid with last spot empty
//         4: "grid-cols-2"
//       };

//       return (
//         <div className={`grid ${gridConfig[Math.min(entries.length, 4)]} gap-0.5 absolute inset-0`}>
//           {entries.slice(0, 4).map((entry, index) => (
//             <div 
//               key={entry.sketchId._id}
//               className={`relative overflow-hidden ${
//                 entries.length === 3 && index === 2 ? "col-span-2" : ""
//               }`}
//             >
//               <img
//                 src={entry.sketchId.thumbnails?.[2]?.url}
//                 alt=""
//                 className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
//               />
//             </div>
//           ))}
//         </div>
//       );
//     };
  
//     if (loading) {
//       return (
//         <div className="max-w-[1200px] mx-auto px-4 py-8">
//           <div className="text-[#9ab]">Loading lists...</div>
//         </div>
//       );
//     }
  
//     return (
//       <div className="max-w-[1200px] mx-auto px-4 py-8">
//         <div className="flex justify-between items-center mb-6">
//           {/* <h2 className="text-xl font-semibold text-[#9ab]">LISTS</h2> */}
//           {isOwnProfile && (
//             <button
//               onClick={() => setShowCreateModal(true)}
//               className="text-[#00c030] hover:text-[#00e054]"
//             >
//               Create a list
//             </button>
//           )}
//         </div>
  
//         {error ? (
//           <div className="text-red-500 bg-red-500/10 p-4 rounded">
//             {error}
//           </div>
//         ) : userLists.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {userLists.map(list => (
//               <Link 
//                 key={list._id}
//                 to={`/lists/${list._id}`}
//                 className="group bg-[#2c3440] rounded overflow-hidden hover:bg-[#384250] transition-colors"
//               >
//                 {/* List Preview Images */}
//                 <div className="relative aspect-video w-full bg-[#1f2937]">
//                   {renderThumbnails(list.entries)}
//                 </div>

//                 {/* List Info */}
//                 <div className="p-4">
//                   <div className="flex justify-between items-start mb-2">
//                     <h3 className="text-white font-medium line-clamp-1 group-hover:text-[#00c030] transition-colors">
//                       {list.title}
//                     </h3>
//                     {isOwnProfile && (
//                       <button
//                         onClick={(e) => handleDeleteList(list._id, e)}
//                         className="text-[#9ab] hover:text-red-500 ml-2"
//                       >
//                         <X size={16} />
//                       </button>
//                     )}
//                   </div>
                  
//                   {list.description && (
//                     <p className="text-sm text-[#9ab] line-clamp-2 mb-2">
//                       {list.description}
//                     </p>
//                   )}

//                   <div className="flex items-center gap-3 text-sm text-[#678]">
//                     <div className="flex items-center gap-1">
//                       <Grid size={14} />
//                       <span>{list.entries.length}</span>
//                     </div>
//                     {list.isRanked && (
//                       <div className="flex items-center gap-1">
//                         <Star size={14} />
//                         <span>Ranked</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12">
//             <p className="text-[#9ab]">
//               {isOwnProfile 
//                 ? "You haven't created any lists yet"
//                 : `${userData.username} hasn't created any lists yet`}
//             </p>
//           </div>
//         )}
  
//         {showCreateModal && (
//           <CreateListModal
//             onClose={() => setShowCreateModal(false)}
//             onListCreated={(newList) => {
//               setUserLists(prev => [newList, ...prev]);
//               setShowCreateModal(false);
//             }}
//           />
//         )}
//       </div>
//     );
// };

// export default ListsContent;

// // import { useState, useEffect } from "react";
// // import axios from "axios";
// // import CreateListModal from "./CreateListModal";
// // import { X, Grid, Star } from 'lucide-react';
// // import { Link } from "react-router-dom";

// // const ListsContent = ({ userData, isOwnProfile }) => {
// //     const [showCreateModal, setShowCreateModal] = useState(false);
// //     const [userLists, setUserLists] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState('');
  
// //     useEffect(() => {
// //       const fetchLists = async () => {
// //         try {
// //           const response = await axios.get(
// //             `${process.env.REACT_APP_API_URL}/api/users/${userData._id}/lists`
// //           );
// //           setUserLists(response.data);
// //         } catch (error) {
// //           console.error('Error fetching lists:', error);
// //           setError('Failed to load lists');
// //         } finally {
// //           setLoading(false);
// //         }
// //       };
  
// //       fetchLists();
// //     }, [userData._id]);
  
// //     const handleDeleteList = async (listId, e) => {
// //       e.preventDefault(); // Prevent navigation when clicking delete
// //       if (!window.confirm('Are you sure you want to delete this list?')) {
// //         return;
// //       }
  
// //       try {
// //         await axios.delete(
// //           `${process.env.REACT_APP_API_URL}/api/lists/${listId}`,
// //           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
// //         );
  
// //         setUserLists(prev => prev.filter(list => list._id !== listId));
// //       } catch (error) {
// //         console.error('Error deleting list:', error);
// //         alert('Failed to delete list');
// //       }
// //     };
  
// //     if (loading) {
// //       return (
// //         <div className="max-w-[1200px] mx-auto px-4 py-8">
// //           <div className="text-[#9ab]">Loading lists...</div>
// //         </div>
// //       );
// //     }
  
// //     return (
// //       <div className="max-w-[1200px] mx-auto px-4 py-8">
// //         <div className="flex justify-between items-center mb-6">
// //           <h2 className="text-xl font-semibold text-[#9ab]">LISTS</h2>
// //           {isOwnProfile && (
// //             <button
// //               onClick={() => setShowCreateModal(true)}
// //               className="text-[#00c030] hover:text-[#00e054]"
// //             >
// //               Create a list
// //             </button>
// //           )}
// //         </div>
  
// //         {error ? (
// //           <div className="text-red-500 bg-red-500/10 p-4 rounded">
// //             {error}
// //           </div>
// //         ) : userLists.length > 0 ? (
// //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// //             {userLists.map(list => (
// //               <Link 
// //                 key={list._id}
// //                 to={`/lists/${list._id}`}
// //                 className="group bg-[#2c3440] rounded overflow-hidden hover:bg-[#384250] transition-colors"
// //               >
// //                 {/* List Preview Images */}
// //                 <div className="relative aspect-video w-full bg-[#1f2937]">
// //                   {list.entries.length > 0 ? (
// //                     <div className="grid grid-cols-2 gap-0.5 absolute inset-0">
// //                       {list.entries.slice(0, 4).map((entry, index) => (
// //                         <div 
// //                           key={entry.sketchId._id}
// //                           className="relative overflow-hidden"
// //                         >
// //                           <img
// //                             src={entry.sketchId.thumbnails?.[0]?.url}
// //                             alt=""
// //                             className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
// //                           />
// //                         </div>
// //                       ))}
// //                     </div>
// //                   ) : (
// //                     <div className="flex items-center justify-center h-full text-[#9ab]">
// //                       <Grid size={32} />
// //                     </div>
// //                   )}
// //                 </div>

// //                 {/* List Info */}
// //                 <div className="p-4">
// //                   <div className="flex justify-between items-start mb-2">
// //                     <h3 className="text-white font-medium line-clamp-1 group-hover:text-[#00c030] transition-colors">
// //                       {list.title}
// //                     </h3>
// //                     {isOwnProfile && (
// //                       <button
// //                         onClick={(e) => handleDeleteList(list._id, e)}
// //                         className="text-[#9ab] hover:text-red-500 ml-2"
// //                       >
// //                         <X size={16} />
// //                       </button>
// //                     )}
// //                   </div>
                  
// //                   {list.description && (
// //                     <p className="text-sm text-[#9ab] line-clamp-2 mb-2">
// //                       {list.description}
// //                     </p>
// //                   )}

// //                   <div className="flex items-center gap-3 text-sm text-[#678]">
// //                     <div className="flex items-center gap-1">
// //                       <Grid size={14} />
// //                       <span>{list.entries.length}</span>
// //                     </div>
// //                     {list.isRanked && (
// //                       <div className="flex items-center gap-1">
// //                         <Star size={14} />
// //                         <span>Ranked</span>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               </Link>
// //             ))}
// //           </div>
// //         ) : (
// //           <div className="text-center py-12">
// //             <p className="text-[#9ab]">
// //               {isOwnProfile 
// //                 ? "You haven't created any lists yet"
// //                 : `${userData.username} hasn't created any lists yet`}
// //             </p>
// //           </div>
// //         )}
  
// //         {showCreateModal && (
// //           <CreateListModal
// //             onClose={() => setShowCreateModal(false)}
// //             onListCreated={(newList) => {
// //               setUserLists(prev => [newList, ...prev]);
// //               setShowCreateModal(false);
// //             }}
// //           />
// //         )}
// //       </div>
// //     );
// // };

// // export default ListsContent;

// // // import { useState, useEffect } from "react";
// // // import axios from "axios";
// // // import CreateListModal from "./CreateListModal";
// // // import { X } from 'lucide-react';
// // // import { Link } from "react-router-dom";

// // // const ListsContent = ({ userData, isOwnProfile }) => {
// // //     const [showCreateModal, setShowCreateModal] = useState(false);
// // //     const [userLists, setUserLists] = useState([]);
// // //     const [loading, setLoading] = useState(true);
// // //     const [error, setError] = useState('');
  
// // //     useEffect(() => {
// // //       const fetchLists = async () => {
// // //         try {
// // //           const response = await axios.get(
// // //             `${process.env.REACT_APP_API_URL}/api/users/${userData._id}/lists`
// // //           );
// // //           setUserLists(response.data);
// // //         } catch (error) {
// // //           console.error('Error fetching lists:', error);
// // //           setError('Failed to load lists');
// // //         } finally {
// // //           setLoading(false);
// // //         }
// // //       };
  
// // //       fetchLists();
// // //     }, [userData._id]);
  
// // //     const handleDeleteList = async (listId) => {
// // //       if (!window.confirm('Are you sure you want to delete this list?')) {
// // //         return;
// // //       }
  
// // //       try {
// // //         await axios.delete(
// // //           `${process.env.REACT_APP_API_URL}/api/lists/${listId}`,
// // //           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
// // //         );
  
// // //         setUserLists(prev => prev.filter(list => list._id !== listId));
// // //       } catch (error) {
// // //         console.error('Error deleting list:', error);
// // //         alert('Failed to delete list');
// // //       }
// // //     };
  
// // //     if (loading) {
// // //       return (
// // //         <div className="max-w-[1200px] mx-auto px-4 py-8">
// // //           <div className="text-[#9ab]">Loading lists...</div>
// // //         </div>
// // //       );
// // //     }
  
// // //     return (
// // //       <div className="max-w-[1200px] mx-auto px-4 py-8">
// // //         <div className="flex justify-between items-center mb-6">
// // //           <h2 className="text-xl font-semibold text-[#9ab]">LISTS</h2>
// // //           {isOwnProfile && (
// // //             <button
// // //               onClick={() => setShowCreateModal(true)}
// // //               className="text-[#00c030] hover:text-[#00e054]"
// // //             >
// // //               Create a list
// // //             </button>
// // //           )}
// // //         </div>
  
// // //         {error ? (
// // //           <div className="text-red-500 bg-red-500/10 p-4 rounded">
// // //             {error}
// // //           </div>
// // //         ) : userLists.length > 0 ? (
// // //           <div className="grid gap-4">
// // //             {userLists.map(list => (
// // //             //   <div 
// // //             //     key={list._id} 
// // //             //     className="bg-[#2c3440] p-4 rounded hover:bg-[#384250] transition-colors"
// // //             //   >
// // //             <Link 
// // //   to={`/lists/${list._id}`}
// // //   className="bg-[#2c3440] p-4 rounded hover:bg-[#384250] transition-colors"
// // // >
// // //                 <div className="flex justify-between items-start">
// // //                   <div>
// // //                     <h3 className="text-white font-medium mb-2">{list.title}</h3>
// // //                     {list.description && (
// // //                       <p className="text-[#9ab] mb-4">{list.description}</p>
// // //                     )}
// // //                     <div className="text-sm text-[#678]">
// // //                       {list.entries.length} sketches
// // //                       {list.isRanked && ' • Ranked'}
// // //                     </div>
// // //                   </div>
  
// // //                   {list.entries.length > 0 && (
// // //                     <div className="flex -space-x-2 ml-4">
// // //                       {list.entries.slice(0, 3).map(entry => (
// // //                         <img
// // //                           key={entry.sketchId._id}
// // //                           src={entry.sketchId.thumbnails?.[0]?.url}
// // //                           alt={entry.sketchId.title}
// // //                           className="w-16 h-10 object-cover rounded border border-[#14181c]"
// // //                         />
// // //                       ))}
// // //                     </div>
// // //                   )}
  
// // //                   {isOwnProfile && (
// // //                     <button
// // //                       onClick={() => handleDeleteList(list._id)}
// // //                       className="ml-4 text-[#9ab] hover:text-red-500"
// // //                     >
// // //                       <X size={16} />
// // //                     </button>
// // //                   )}
// // //                 </div>
// // //               {/* </div> */}
// // //               </Link>
// // //             ))}
// // //           </div>
// // //         ) : (
// // //           <div className="text-center py-12">
// // //             <p className="text-[#9ab]">
// // //               {isOwnProfile 
// // //                 ? "You haven't created any lists yet"
// // //                 : `${userData.username} hasn't created any lists yet`}
// // //             </p>
// // //           </div>
// // //         )}
  
// // //         {showCreateModal && (
// // //           <CreateListModal
// // //             onClose={() => setShowCreateModal(false)}
// // //             onListCreated={(newList) => {
// // //               setUserLists(prev => [newList, ...prev]);
// // //               setShowCreateModal(false);
// // //             }}
// // //           />
// // //         )}
// // //       </div>
// // //     );
// // //   };

// // // export default ListsContent;
  