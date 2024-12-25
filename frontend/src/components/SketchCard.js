// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Star, Eye } from 'lucide-react';

// const SketchCard = ({ sketch }) => {
//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//       <Link to={`/sketch/${sketch._id}`}>
//         <img
//           src={sketch.thumbnail}
//           alt={sketch.title}
//           className="w-full h-48 object-cover"
//         />
//       </Link>
//       <div className="p-4">
//         <Link 
//           to={`/sketch/${sketch._id}`}
//           className="font-semibold hover:text-blue-600"
//         >
//           {sketch.title}
//         </Link>
//         <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
//           <div className="flex items-center">
//             <Star className="text-yellow-400" size={16} />
//             <span className="ml-1">
//               {sketch.averageRating 
//                 ? `${sketch.averageRating} (${sketch.reviewCount})`
//                 : 'No ratings'}
//             </span>
//           </div>
//           <div className="flex items-center">
//             <Eye size={16} className="mr-1" />
//             <span>{sketch.viewCount}</span>
//           </div>
//         </div>
//         <div className="mt-2 text-sm text-gray-500 flex justify-between">
//           {/* <span>{sketch.duration}</span> */}
//           {/* <span>{sketch.publishedTime}</span> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SketchCard;

// src/components/SketchCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SketchCard = ({ sketch }) => {
  return (
    <Link 
      to={`/sketch/${sketch._id}`}
      className="group relative aspect-[2/3] overflow-hidden rounded bg-[#2c3440]"
    >
      <img
        src={sketch.thumbnails?.[sketch.thumbnails.length - 1]?.url || sketch.thumbnails?.high}
        alt={sketch.title}
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
      />
      <div className="absolute inset-0 group-hover:border-[3px] border-[#00e054] rounded transition-all duration-200" />
    </Link>
  );
};

export default SketchCard;