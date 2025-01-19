import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import UserAvatar from '../components/UseAvatar';

const Members = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);

         // Add debugging logs
         console.log('Fetched Users:', response.data);
         response.data.forEach(user => {
           console.log(`User ${user.username}:`, {
             photoUrl: user.photoUrl,
             hasPhotoUrl: !!user.photoUrl
           });
         });

         
        setUsers(response.data);
      } catch (error) {
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
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
    <div className="min-h-screen bg-[#14181c]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-[#9ab]">MEMBERS</h1>
          
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2c3440] text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00e054] placeholder-[#9ab]"
            />
          </div>

          {/* User list */}
          <div className="grid gap-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <Link 
                  key={user._id}
                  to={`/members/${user._id}`}
                  className="bg-[#2c3440] p-4 rounded hover:bg-[#384250] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* <div className="w-12 h-12 bg-[#14181c] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg text-[#9ab]">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div> */}
                       <UserAvatar 
                      user={user} 
                      size="medium" 
                    />

                    <div>
                      <h2 className="text-white font-medium">{user.username}</h2>
                      <p className="text-sm text-[#9ab]">
                        {/* {user.reviewCount || 0} reviews  */}
                        {user.reviews.filter(review => review.sketch).length} reviews
                        {user.favoriteSketchIds?.length > 0 && ` • ${user.favoriteSketchIds.length} favorites`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-[#9ab] text-center py-8">
                No members found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';

// const Members = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
//         setUsers(response.data);
//       } catch (error) {
//         setError('Failed to load members');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   if (loading) {
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
//         <h1 className="text-2xl font-semibold text-[#9ab] mb-8">MEMBERS</h1>
        
//         <div className="grid gap-4">
//           {users.map(user => (
//             <Link 
//               key={user._id}
//               to={`/members/${user._id}`}
//               className="bg-[#2c3440] p-4 rounded hover:bg-[#384250] transition-colors"
//             >
//               <div className="flex items-center gap-4">
//                 {/* User avatar */}
//                 <div className="w-12 h-12 bg-[#14181c] rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-lg text-[#9ab]">
//                     {user.username[0].toUpperCase()}
//                   </span>
//                 </div>

//                 <div>
//                   <h2 className="text-white font-medium">{user.username}</h2>
//                   <p className="text-sm text-[#9ab]">
//                     {user.reviewCount || 0} reviews 
//                     {user.favoriteSketchIds?.length > 0 && ` • ${user.favoriteSketchIds.length} favorites`}
//                   </p>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Members;