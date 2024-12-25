// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedSketch = ({ sketch }) => (
  <div className="absolute inset-0 bg-cover bg-center" 
       style={{ 
         backgroundImage: `url(${sketch?.thumbnails?.high})`,
         backgroundSize: 'cover' 
       }}>
    <div className="absolute inset-0 bg-vignette"></div>
    <div className="absolute bottom-0 left-0 right-0 p-20 text-center">
      <h1 className="text-4xl font-serif text-white leading-relaxed max-w-4xl mx-auto">
        Track sketches you've watched.
        <br />
        Save those you want to see.
        <br />
        Tell your friends what's good.
      </h1>
    </div>
    {sketch && (
      <div className="absolute top-1/2 -right-32 transform -rotate-90 text-text-secondary">
        <Link to={`/sketch/${sketch._id}`} className="hover:text-text-primary transition-colors">
          {sketch.title}
        </Link>
      </div>
    )}
  </div>
);

const HomePage = () => {
  const [featuredSketch, setFeaturedSketch] = React.useState(null);

  return (
    <div className="min-h-screen bg-base">
      {/* Hero Section */}
      <div className="relative h-screen">
        <FeaturedSketch sketch={featuredSketch} />
      </div>

      {/* Get Started Section */}
      <div className="text-center py-12">
        <Link 
          to="/signup" 
          className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded
                     font-semibold tracking-wide transition-colors"
        >
          GET STARTED — IT'S FREE!
        </Link>
        <p className="mt-6 text-text-secondary">
          The social network for comedy lovers.
        </p>
      </div>

      {/* Featured Sketches Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[2/3] overflow-hidden rounded">
              <div className="w-full h-full bg-surface hover:border-2 hover:border-accent 
                            transition-all duration-200"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-text-secondary text-sm tracking-wider mb-8">
          SNL SKETCH TRACKER LETS YOU…
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "👁️", color: "accent", title: "Track every sketch you've watched" },
            { icon: "❤️", color: "orange", title: "Like your favorite sketches and reviews" },
            { icon: "✍️", color: "blue", title: "Write and share your reviews" },
            { icon: "⭐", color: "yellow", title: "Rate sketches on a five-star scale" },
            { icon: "📅", color: "purple", title: "Keep a watching diary" },
            { icon: "📝", color: "pink", title: "Create and share lists" },
          ].map((feature, i) => (
            <div 
              key={i}
              className="bg-surface p-6 rounded hover:bg-accent transition-colors 
                         cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{feature.icon}</span>
                <p className="text-text-primary text-sm">{feature.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;