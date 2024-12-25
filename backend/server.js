require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

// Import models
const Sketch = require('./models/Sketch');
const User = require('./models/User');
const Review = require('./models/Review');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  next();
});


const MONGODB_URI = process.env.MONGODB_URI;

// Fix URL construction
let DB_URI = MONGODB_URI;
if (!DB_URI.includes('snl_tracker')) {
  // Remove trailing slash if exists
  const baseUri = DB_URI.split('?')[0].replace(/\/$/, '');
  const params = DB_URI.includes('?') ? '?' + DB_URI.split('?')[1] : '';
  DB_URI = `${baseUri}/snl_tracker${params}`;
}

// Add debugging
console.log('Original URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'));
console.log('Modified URI:', DB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'));

// Connect with explicit database name
mongoose.connect(DB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('Current database:', mongoose.connection.db.databaseName);
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// YouTube API setup
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

//debug route to check the database contents
app.get('/api/debug', async (req, res) => {
  try {
    console.log('🔍 Debugging MongoDB connection...');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Get count from sketches collection directly
    const count = await Sketch.estimatedDocumentCount();
    console.log('Sketch count:', count);
    
    // Get a sample sketch to verify schema
    const sampleSketch = await Sketch.findOne();
    console.log('Sample sketch:', JSON.stringify(sampleSketch, null, 2));

    res.json({
      collections: collections.map(c => c.name),
      sketchCount: count,
      sampleSketch
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

const convertDurationToSeconds = (duration) => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) { // "M:SS" format
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) { // "H:MM:SS" format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };
  
  const parseViewCount = (viewCount) => {
    if (!viewCount) return 0;
    const number = viewCount.replace(/[^0-9]/g, '');
    return parseInt(number);
  };
  
  app.get('/api/sketches', async (req, res) => {
    console.log('Fetching sketches with params:', req.query);
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      // Add case-insensitive search
    if (req.query.search) {
        console.log('Search query:', req.query.search);
        query.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ];
      }
  
      console.log('MongoDB query:', JSON.stringify(query, null, 2));
  
      const [sketches, totalSketches] = await Promise.all([
        Sketch.find(query)
          .sort({ publishedTime: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Sketch.countDocuments(query)
      ]);
  
      console.log(`Found ${totalSketches} matching sketches`);
  
      // Transform the data
      const transformedSketches = sketches.map(sketch => ({
        ...sketch,
        durationSeconds: convertDurationToSeconds(sketch.duration),
        viewCountNumber: parseViewCount(sketch.viewCount),
        thumbnail: sketch.thumbnails?.[sketch.thumbnails.length - 1]?.url || '' // Get highest quality thumbnail
      }));
  
      // Get review stats
      const sketchIds = sketches.map(s => s._id);
      const reviewStats = await Review.aggregate([
        { $match: { sketch: { $in: sketchIds } } },
        { 
          $group: {
            _id: '$sketch',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 }
          }
        }
      ]);
  
      // Combine everything
      const sketchesWithStats = transformedSketches.map(sketch => {
        const stats = reviewStats.find(r => r._id.equals(sketch._id));
        return {
          ...sketch,
          averageRating: stats ? Number(stats.averageRating.toFixed(1)) : null,
          reviewCount: stats ? stats.reviewCount : 0
        };
      });
  
      res.json({
        sketches: sketchesWithStats,
        currentPage: page,
        totalPages: Math.ceil(totalSketches / limit),
        totalSketches
      });
    } catch (error) {
      console.error('Error fetching sketches:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ email, password: hashedPassword, username });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid login credentials');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid login credentials');
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});


app.get('/api/sketches/:id', async (req, res) => {
    console.log('\n📋 Fetching single sketch...');
    console.log('Sketch ID:', req.params.id);
    
    try {
      const sketch = await Sketch.findById(req.params.id);
      
      if (!sketch) {
        console.log('❌ Sketch not found');
        return res.status(404).json({ error: 'Sketch not found' });
      }
  
      console.log('✅ Found sketch:', sketch.title);
      res.json(sketch);
    } catch (error) {
      console.error('❌ Error fetching sketch:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Fetch sketches from YouTube and store in DB
app.get('/api/sync-sketches', async (req, res) => {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      channelId: 'UCqFzWxSCi39LnW1JKFR3efg', // SNL's channel ID
      type: 'video',
      maxResults: 50,
      order: 'viewCount'
    });

    const sketches = await Promise.all(response.data.items.map(async item => {
      const videoStats = await youtube.videos.list({
        part: 'statistics',
        id: item.id.videoId
      });

      return new Sketch({
        title: item.snippet.title,
        youtubeId: item.id.videoId,
        viewCount: videoStats.data.items[0].statistics.viewCount,
        airDate: item.snippet.publishedAt
      });
    }));

    await Sketch.insertMany(sketches);
    res.send({ message: 'Sketches synced successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// // Get sketches with pagination
// app.get('/api/sketches', async (req, res) => {
//     console.log('\n📋 Fetching sketches...');
//     console.log('Query params:', req.query);
    
//     try {
//       const { page = 1, limit = 10, sort = 'viewCount' } = req.query;
//       console.log(`Page: ${page}, Limit: ${limit}, Sort: ${sort}`);
  
//       const sketches = await Sketch.find()
//         .sort({ [sort]: -1 })
//         .limit(limit * 1)
//         .skip((page - 1) * limit)
//         .exec();
  
//       const count = await Sketch.countDocuments();
//       console.log(`✅ Found ${sketches.length} sketches (Total: ${count})`);
      
//       const response = {
//         sketches,
//         totalPages: Math.ceil(count / limit),
//         currentPage: page
//       };
//       console.log('Response metadata:', {
//         totalPages: response.totalPages,
//         currentPage: response.currentPage,
//         sketchesCount: response.sketches.length
//       });
  
//       res.send(response);
//     } catch (error) {
//       console.error('❌ Error fetching sketches:', error);
//       res.status(500).send(error);
//     }
//   });

//  Review routes
app.post('/api/reviews', auth, async (req, res) => {
    console.log('Creating new review...');
    try {
      const { sketchId, rating, text } = req.body;
      
      // Create and save the review
      const review = new Review({
        user: req.userId,
        sketch: sketchId,
        rating,
        text
      });
      await review.save();
      console.log('Review saved:', review._id);
  
      // Update sketch's average rating
      const reviews = await Review.find({ sketch: sketchId });
      const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
      
      await Sketch.findByIdAndUpdate(sketchId, { 
        averageRating: avgRating.toFixed(1) 
      });
      
      // Return populated review
      const populatedReview = await Review.findById(review._id)
        .populate('user', 'username');
        
      res.status(201).json(populatedReview);
    } catch (error) {
      console.error('Review creation error:', error);
      res.status(400).json({ error: error.message });
    }
  });
  
  app.get('/api/sketches/:id/reviews', async (req, res) => {
    try {
      const reviews = await Review.find({ sketch: req.params.id })
        .populate('user', 'username')
        .sort('-createdAt');
      
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/users/:userId/reviews', async (req, res) => {
    try {
      const reviews = await Review.find({ user: req.params.userId })
        .populate('sketch', 'title thumbnails videoId')  // Get sketch details
        .sort('-createdAt');
      
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ error: error.message });
    }
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
