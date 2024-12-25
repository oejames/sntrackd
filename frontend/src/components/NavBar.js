// // src/components/Navbar.jsx
// import React, { useState } from 'react';
// import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import { Search } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
//     } else {
//       navigate('/');
//     }
//   };

//   return (
//     <>
//       <nav className="bg-surface-dark border-b border-divider">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <Link to="/" className="text-primary font-bold text-2xl">
//                 SNL Archive
//               </Link>
//               <div className="hidden md:flex ml-10 space-x-8">
//                 <Link 
//                   to="/" 
//                   className="text-text-secondary hover:text-text transition"
//                 >
//                   Sketches
//                 </Link>
//                 <Link 
//                   to="/cast" 
//                   className="text-text-secondary hover:text-text transition"
//                 >
//                   Cast
//                 </Link>
//                 <Link 
//                   to="/seasons" 
//                   className="text-text-secondary hover:text-text transition"
//                 >
//                   Seasons
//                 </Link>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//             <form onSubmit={handleSearch} className="relative">
//           <input
//             type="search"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search sketches..."
//             className="px-4 py-2 rounded-lg text-gray-800 w-64"
//           />
//           <button 
//             type="submit" 
//             className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
//           >
//             <Search size={20} />
//           </button>
//         </form>

//               {user ? (
//                 <div className="flex items-center space-x-4">
//                   <Link 
//                     to="/profile"
//                     className="text-text-secondary hover:text-text transition"
//                   >
//                     {user.username}
//                   </Link>
//                   <button
//                     onClick={logout}
//                     className="text-text-secondary hover:text-text transition"
//                   >
//                     Log out
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex items-center space-x-4">
//                   <Link 
//                     to="/login"
//                     className="text-text-secondary hover:text-text transition"
//                   >
//                     Sign in
//                   </Link>
//                   <Link
//                     to="/register"
//                     className="bg-primary hover:bg-primary-dark text-surface px-4 py-2 rounded-md transition"
//                   >
//                     Create account
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>
//       <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
//     </>
//   );
// };

// export default Navbar;

// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-[#14181c] h-[72px] fixed w-full top-0 z-50 border-b border-[#2c3440]">
      <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link to="/" className="text-white text-2xl font-bold">
            SNL Archive
          </Link>

          {/* Main Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/sketches" 
              className="text-[#9ab] hover:text-white text-sm font-semibold tracking-wide transition-colors"
            >
              SKETCHES
            </Link>
            <Link 
              to="/lists" 
              className="text-[#9ab] hover:text-white text-sm font-semibold tracking-wide transition-colors"
            >
              LISTS
            </Link>
            <Link 
              to="/members" 
              className="text-[#9ab] hover:text-white text-sm font-semibold tracking-wide transition-colors"
            >
              MEMBERS
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sketches..."
              className="w-[250px] h-9 pl-3 pr-10 rounded-md bg-white/70 hover:bg-white/90 focus:bg-white 
                        text-black text-sm outline-none transition-colors"
            />
            <button 
              type="submit" 
              className="absolute right-0 top-0 h-9 px-3 flex items-center"
            >
              <Search size={16} className="text-black" />
            </button>
          </form>


          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center space-x-6">
              <Link 
                to="/profile" 
                className="text-[#9ab] hover:text-white text-sm font-semibold tracking-wide transition-colors"
              >
                {user.username}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-[#9ab] hover:text-white text-sm font-semibold tracking-wide transition-colors"
              >
                LOG OUT
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link 
                to="/login" 
                className="text-[#9ab] hover:text-white text-sm font-semibold tracking-wide transition-colors"
              >
                SIGN IN
              </Link>
              <Link 
                to="/register"
                className="text-sm font-semibold tracking-wide bg-[#00c030] hover:bg-[#00e054] 
                         px-4 py-2 rounded text-white transition-colors"
              >
                CREATE ACCOUNT
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;