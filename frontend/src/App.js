import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SketchDetail from './pages/SketchDetail';
import Profile from './pages/Profile';
import Members from './pages/Members';
import Sketches from './pages/Sketches';
import Reviews from './pages/Reviews';
import Activity from './pages/Activity.js';
import About from './pages/About.js';
import ListPage from './pages/ListPage.js';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import './styles/main.css';
import Lists from './pages/Lists.js';

// wrapper component to use useLocation so the 72px padding doesnt show up if location is sketch page
const AppContent = () => {
  const location = useLocation();
  const isSketchPage = location.pathname.includes('/sketch/');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);


  return (
    <div className={`min-h-screen bg-[#14181c]`}>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sketch/:id" element={<SketchDetail />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:userId" element={<Profile />} /> 
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/sketches" element={<Sketches />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/about" element={<About/>}/>
        <Route path='/lists' element={<Lists/>}></Route>
        <Route path="/lists/:listId" element={<ListPage />} />
        <Route path="/activity" element={<PrivateRoute><Activity /></PrivateRoute>} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;