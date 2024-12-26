// // src/pages/Activity.jsx
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Star } from 'lucide-react';
// import axios from 'axios';

// const Activity = () => {
//   const [activity, setActivity] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchActivity = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/activity`,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );
//         setActivity(response.data);
//       } catch (error) {
//         console.error('Error fetching activity:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchActivity();
//   }, []);

//   if (loading) return <div className="text-[#9ab]">Loading...</div>;

//   return (
//     <div className="min-h-screen bg-[#14181c]">
//       <div className="max-w-[1200px] mx-auto px-4 py-8">
//         <h1 className="text-2xl font-semibold text-[#9ab] mb-8">ACTIVITY</h1>
//         <div className="space-y-6">
//           {activity.map(item => (
//             <div key={item._id} className="bg-[#2c3440] p-4 rounded">
//               <Link 
//                 to={`/profile/${item.user._id}`}
//                 className="text-[#9ab] hover:text-[#00c030]"
//               >
//                 {item.user.username}
//               </Link>
//               <span className="text-[#9ab]"> reviewed </span>
//               <Link 
//                 to={`/sketch/${item.sketch._id}`}
//                 className="text-[#9ab] hover:text-[#00c030]"
//               >
//                 {item.sketch.title}
//               </Link>
//               <div className="mt-2 flex items-center gap-2">
//                 <Star className="text-[#00c030]" size={16} />
//                 <span className="text-white">{item.rating}</span>
//               </div>
//               <p className="text-[#9ab] mt-2">{item.text}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Activity;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import axios from 'axios';

const Activity = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/activity`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActivity(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#14181c] flex items-center justify-center text-[#9ab]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#14181c]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-[#9ab] mb-8">ACTIVITY</h1>
        <div className="space-y-6">
          {activity.length > 0 ? (
            activity.map(item => (
              item.user && item.sketch && (
                <div key={item._id} className="bg-[#2c3440] p-4 rounded">
                  <Link to={`/profile/${item.user._id}`} className="text-[#9ab] hover:text-[#00c030]">
                    {item.user.username}
                  </Link>
                  <span className="text-[#9ab]"> reviewed </span>
                  <Link to={`/sketch/${item.sketch._id}`} className="text-[#9ab] hover:text-[#00c030]">
                    {item.sketch.title}
                  </Link>
                  <div className="mt-2 flex items-center gap-2">
                    <Star className="text-[#00c030]" size={16} />
                    <span className="text-white">{item.rating}</span>
                  </div>
                  {item.text && <p className="text-[#9ab] mt-2">{item.text}</p>}
                  <div className="text-sm text-[#678] mt-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="text-[#9ab] text-center">
              <p>No activity to show. Start following other users to see their reviews!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;