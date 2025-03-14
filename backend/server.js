require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { google } = require('googleapis');
const { setupAutoUpdate, runPythonUpdate } = require('./auto-update-service');

//PHOTOS
const{ S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


// Import models
const Sketch = require('./models/Sketch');
const User = require('./models/User');
const Review = require('./models/Review');
// ADDING LISTS
const List = require('./models/List');

const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('build'));  // build directory name??

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

    // adding for the automatic yt channel updates
    app.locals.models = { Sketch, User, Review };  // These models are already imported at the top of file
    setupAutoUpdate(app);
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
    // res.status(401).send({ error: 'Please authenticate' });
    res.status(401).send({ error: 'Please login again' });
  }
};

// Debug route for manual update trigger
app.get('/api/debug/trigger-update', async (req, res) => {
  try {
      console.log('🔍 Manual update trigger received');
      const output = await runPythonUpdate();
      res.json({
          success: true,
          timestamp: new Date().toISOString(),
          ...output
      });
  } catch (error) {
      console.error('Debug update error:', error);
      res.status(500).json({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
      });
  }
});





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


  // trying 
  app.get('/api/sketches', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const sortBy = req.query.sortBy || 'newest';
      const skip = (page - 1) * limit;

      const normalizeString = (str) => {
        return str
          .normalize('NFD')  // Decompose combined characters
          .replace(/[\u0300-\u036f]/g, '')  // Remove accent marks
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // Escape special regex characters
          .toLowerCase();
      };
  
      // Build search query
      const searchQuery = {};
      if (req.query.search) {
        const normalizedSearch = normalizeString(req.query.search);
        searchQuery.$or = [
          { title: { $regex: normalizedSearch, $options: 'i' } },
          { description: { $regex: normalizedSearch, $options: 'i' } }
        ];
      }
  
      let sketches;
      let totalSketches;
  
      if (sortBy === 'popular') {
        // For popular sorting, integrate search into the aggregation pipeline
        const popularSketches = await Review.aggregate([
          // First lookup sketches to apply search
          {
            $lookup: {
              from: 'sketches',
              localField: 'sketch',
              foreignField: '_id',
              as: 'sketchDetails'
            }
          },
          // Unwind the sketch details
          { $unwind: '$sketchDetails' },
          // Apply search filter if exists
          ...(Object.keys(searchQuery).length > 0 ? [
            {
              $match: {
                $or: [
                  { 'sketchDetails.title': { $regex: req.query.search, $options: 'i' } },
                  { 'sketchDetails.description': { $regex: req.query.search, $options: 'i' } }
                ]
              }
            }
          ] : []),
          // Group by sketch to get counts
          {
            $group: {
              _id: '$sketchDetails._id',
              reviewCount: { $sum: 1 },
              avgRating: { $avg: '$rating' },
              sketchDetails: { $first: '$sketchDetails' }
            }
          },
          // Sort by review count
          { $sort: { reviewCount: -1 } },
          // Project final fields
          {
            $project: {
              _id: 1,
              title: '$sketchDetails.title',
              thumbnails: '$sketchDetails.thumbnails',
              publishedTimeText: '$sketchDetails.publishedTimeText',
              videoId: '$sketchDetails.videoId',
              reviewCount: 1,
              averageRating: { $round: ['$avgRating', 1] }
            }
          },
          // Apply pagination
          { $skip: skip },
          { $limit: limit }
        ]);
  
        sketches = popularSketches;
  
        // Get total count of matching sketches with reviews
        totalSketches = await Review.aggregate([
          {
            $lookup: {
              from: 'sketches',
              localField: 'sketch',
              foreignField: '_id',
              as: 'sketchDetails'
            }
          },
          { $unwind: '$sketchDetails' },
          ...(Object.keys(searchQuery).length > 0 ? [
            {
              $match: {
                $or: [
                  { 'sketchDetails.title': { $regex: req.query.search, $options: 'i' } },
                  { 'sketchDetails.description': { $regex: req.query.search, $options: 'i' } }
                ]
              }
            }
          ] : []),
          {
            $group: {
              _id: '$sketch'
            }
          }
        ]).then(results => results.length);
  
      } else {
        // For newest/oldest, apply search directly to Sketch model
        const sortOption = sortBy === 'oldest' ? { importDate: -1 } : { importDate: 1 };
        
        sketches = await Sketch.find(searchQuery)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .lean();
  
        // Get review stats for these sketches
        const sketchIds = sketches.map(s => s._id);
        const reviewStats = await Review.aggregate([
          {
            $match: { sketch: { $in: sketchIds } }
          },
          {
            $group: {
              _id: '$sketch',
              reviewCount: { $sum: 1 },
              avgRating: { $avg: '$rating' }
            }
          }
        ]);
  
        // Map stats to sketches
        sketches = sketches.map(sketch => {
          const stats = reviewStats.find(stat => 
            stat._id.toString() === sketch._id.toString()
          );
          return {
            ...sketch,
            reviewCount: stats?.reviewCount || 0,
            averageRating: stats ? Number(stats.avgRating.toFixed(1)) : null
          };
        });
  
        totalSketches = await Sketch.countDocuments(searchQuery);
      }
  
      res.json({
        sketches,
        currentPage: page,
        totalPages: Math.ceil(totalSketches / limit),
        totalSketches
      });
    } catch (error) {
      console.error('Error fetching sketches:', error);
      res.status(500).json({ error: error.message });
    }
  });
//   // server.js - modified sketches route
// app.get('/api/sketches', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 12;
//     const sortBy = req.query.sortBy || 'newest';
//     const skip = (page - 1) * limit;

//     let sketches;
//     let totalSketches;

//     if (sortBy === 'popular') {
//       // First get the counts and sketches in one operation
//       const popularSketches = await Review.aggregate([
//         // Group by sketch to get counts
//         {
//           $group: {
//             _id: '$sketch',
//             reviewCount: { $sum: 1 },
//             avgRating: { $avg: '$rating' }
//           }
//         },
//         // Sort by review count
//         { $sort: { reviewCount: -1 } },
//         // Lookup the actual sketch documents
//         {
//           $lookup: {
//             from: 'sketches',
//             localField: '_id',
//             foreignField: '_id',
//             as: 'sketchDetails'
//           }
//         },
//         // Unwind the sketch details array
//         { $unwind: '$sketchDetails' },
//         // Combine sketch details with review stats
//         {
//           $project: {
//             _id: '$sketchDetails._id',
//             title: '$sketchDetails.title',
//             thumbnails: '$sketchDetails.thumbnails',
//             publishedTimeText: '$sketchDetails.publishedTimeText',
//             videoId: '$sketchDetails.videoId',
//             reviewCount: 1,
//             averageRating: { $round: ['$avgRating', 1] }
//           }
//         },
//         // Apply pagination
//         { $skip: skip },
//         { $limit: limit }
//       ]);
    
//       sketches = popularSketches;
    
//       // Get total count of sketches with reviews
//       totalSketches = await Review.aggregate([
//         {
//           $group: {
//             _id: '$sketch'
//           }
//         }
//       ]).then(results => results.length);

//     } else {
//       // For newest/oldest, just sort by importDate
//       const sortOption = sortBy === 'oldest' ? { importDate: -1 } : { importDate: 1 };
      
//       sketches = await Sketch.find()
//         .sort(sortOption)
//         .skip(skip)
//         .limit(limit)
//         .lean();

//       // Get review stats for these sketches
//       const sketchIds = sketches.map(s => s._id);
//       const reviewStats = await Review.aggregate([
//         {
//           $match: { sketch: { $in: sketchIds } }
//         },
//         {
//           $group: {
//             _id: '$sketch',
//             reviewCount: { $sum: 1 },
//             avgRating: { $avg: '$rating' }
//           }
//         }
//       ]);

//       // Map stats to sketches
//       sketches = sketches.map(sketch => {
//         const stats = reviewStats.find(stat => 
//           stat._id.toString() === sketch._id.toString()
//         );
//         return {
//           ...sketch,
//           reviewCount: stats?.reviewCount || 0,
//           averageRating: stats ? Number(stats.avgRating.toFixed(1)) : null
//         };
//       });

//       totalSketches = await Sketch.countDocuments();
//     }

//     res.json({
//       sketches,
//       currentPage: page,
//       totalPages: Math.ceil(totalSketches / limit),
//       totalSketches
//     });

//   } catch (error) {
//     console.error('Error fetching sketches:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // modified sketches route
// app.get('/api/sketches', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 12;
//     const sortBy = req.query.sortBy || 'newest';
//     const skip = (page - 1) * limit;

//     // First get review counts for all sketches
//     const reviewCounts = await Review.aggregate([
//       {
//         $group: {
//           _id: '$sketch',
//           count: { $sum: 1 },
//           avgRating: { $avg: '$rating' }
//         }
//       }
//     ]);

//     // Create a map for easy lookup
//     const reviewCountMap = reviewCounts.reduce((acc, curr) => {
//       acc[curr._id.toString()] = { 
//         count: curr.count,
//         avgRating: curr.avgRating 
//       };
//       return acc;
//     }, {});

//     let sortOption = {};
//     switch (sortBy) {
//       case 'newest':
//         sortOption = { importDate: 1 }; // Sort by when we imported it
//         break;
//       case 'oldest':
//         sortOption = { importDate: -1 };
//         break;
//       // Don't set sort option for 'popular', we'll sort after getting review counts
//       case 'popular':
//       default:
//         sortOption = { importDate: -1 };
//     }

//     let sketches = await Sketch.find()
//       .sort(sortOption)
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     // Add review counts to sketches
//     const sketchesWithStats = sketches.map(sketch => ({
//       ...sketch,
//       reviewCount: reviewCountMap[sketch._id.toString()]?.count || 0,
//       avgRating: reviewCountMap[sketch._id.toString()]?.avgRating || 0
//     }));

//     // If sorting by popularity, sort by review count
//     if (sortBy === 'popular') {
//       sketchesWithStats.sort((a, b) => b.reviewCount - a.reviewCount);
//     }

//     const totalSketches = await Sketch.countDocuments();

//     res.json({
//       sketches: sketchesWithStats,
//       currentPage: page,
//       totalPages: Math.ceil(totalSketches / limit),
//       totalSketches
//     });

//   } catch (error) {
//     console.error('Error fetching sketches:', error);
//     res.status(500).json({ error: error.message });
//   }
// });
  
  // app.get('/api/sketches', async (req, res) => {
  //   console.log('Fetching sketches with params:', req.query);
  //   try {
  //     const page = parseInt(req.query.page) || 1;
  //     const limit = parseInt(req.query.limit) || 12;
  //     const skip = (page - 1) * limit;
      
  //     // Build query
  //     const query = {};
  //     // Add case-insensitive search
  //   if (req.query.search) {
  //       console.log('Search query:', req.query.search);
  //       query.$or = [
  //         { title: { $regex: req.query.search, $options: 'i' } },
  //         { description: { $regex: req.query.search, $options: 'i' } }
  //       ];
  //     }
  
  //     console.log('MongoDB query:', JSON.stringify(query, null, 2));
  
  //     const [sketches, totalSketches] = await Promise.all([
  //       Sketch.find(query)
  //         .sort({ publishedTime: -1 })
  //         .skip(skip)
  //         .limit(limit)
  //         .lean(),
  //       Sketch.countDocuments(query)
  //     ]);
  
  //     console.log(`Found ${totalSketches} matching sketches`);
  
  //     // Transform the data
  //     const transformedSketches = sketches.map(sketch => ({
  //       ...sketch,
  //       durationSeconds: convertDurationToSeconds(sketch.duration),
  //       viewCountNumber: parseViewCount(sketch.viewCount),
  //       thumbnail: sketch.thumbnails?.[sketch.thumbnails.length - 1]?.url || '' // Get highest quality thumbnail
  //     }));
  
  //     // Get review stats
  //     const sketchIds = sketches.map(s => s._id);
  //     const reviewStats = await Review.aggregate([
  //       { $match: { sketch: { $in: sketchIds } } },
  //       { 
  //         $group: {
  //           _id: '$sketch',
  //           averageRating: { $avg: '$rating' },
  //           reviewCount: { $sum: 1 }
  //         }
  //       }
  //     ]);
  
  //     // Combine everything
  //     const sketchesWithStats = transformedSketches.map(sketch => {
  //       const stats = reviewStats.find(r => r._id.equals(sketch._id));
  //       return {
  //         ...sketch,
  //         averageRating: stats ? Number(stats.averageRating.toFixed(1)) : null,
  //         reviewCount: stats ? stats.reviewCount : 0
  //       };
  //     });
  
  //     res.json({
  //       sketches: sketchesWithStats,
  //       currentPage: page,
  //       totalPages: Math.ceil(totalSketches / limit),
  //       totalSketches
  //     });
  //   } catch (error) {
  //     console.error('Error fetching sketches:', error);
  //     res.status(500).json({ error: error.message });
  //   }
  // });
  
// Routes
// app.post('/api/register', async (req, res) => {
//   try {
//     const { email, password, username } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 8);
//     const user = new User({ email, password: hashedPassword, username });
//     await user.save();
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
//     res.status(201).send({ user, token });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// app.post('/api/register', async (req, res) => {
//   try {
//     const { email, password, username } = req.body;

//     // Check if username already exists
//     const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({ 
//         error: 'Username is already taken' 
//       });
//     }

//     // Check if email already exists
//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({ 
//         error: 'Email is already registered' 
//       });
//     }

//     // If both checks pass, create the new user
//     const hashedPassword = await bcrypt.hash(password, 8);
//     const user = new User({ 
//       email, 
//       password: hashedPassword, 
//       username 
//     });
    
//     await user.save();
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
//     res.status(201).json({ 
//       user, 
//       token 
//     });

//   } catch (error) {
//     // Handle other potential errors
//     console.error('Registration error:', error);
//     res.status(400).json({ 
//       error: 'Registration failed. Please try again.' 
//     });
//   }
// });

// app.post('/api/register', async (req, res) => {
//   try {
//     const { email, password, username } = req.body;

//     // Check if username already exists
//     const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({ 
//         message: `Username "${username}" is already taken. Please choose another.` 
//       });
//     }

//     // Check if email already exists
//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({ 
//         message: `Email "${email}" is already registered. Please use another email or login.` 
//       });
//     }

//     // If both checks pass, create the new user
//     const hashedPassword = await bcrypt.hash(password, 8);
//     const user = new User({ 
//       email, 
//       password: hashedPassword, 
//       username 
//     });
    
//     await user.save();
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
//     res.status(201).json({ 
//       user, 
//       token 
//     });

//   } catch (error) {
//     // Handle MongoDB unique index violations
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       const value = error.keyValue[field];
//       return res.status(400).json({
//         message: `${field.charAt(0).toUpperCase() + field.slice(1)} "${value}" is already taken. Please choose another.`
//       });
//     }

//     // Handle other errors
//     console.error('Registration error:', error);
//     res.status(400).json({ 
//       message: 'Registration failed: ' + error.message 
//     });
//   }
// });


app.post('/api/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('Username taken error'); // Debug log
      return res.status(400).send({ 
        error: `Username "${username}" is already taken` 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log('Email taken error'); // Debug log
      return res.status(400).send({ 
        error: `Email "${email}" is already registered` 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ 
      email, 
      password: hashedPassword, 
      username 
    });
    
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.status(201).send({ 
      user, 
      token 
    });

  } catch (error) {
    console.error('Registration error:', error); // Debug log
    
    // Handle MongoDB unique index violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return res.status(400).send({
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} "${value}" is already taken`
      });
    }

    res.status(400).send({ 
      error: error.message || 'Registration failed'
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid login credentials');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid login credentials');
    
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET
      // { expiresIn: '7d' }  // Make tokens last 7 days
    );
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




app.get('/api/reviews', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sortBy = req.query.sortBy || 'newest';
    const skip = (page - 1) * limit;

    // Only get reviews that have valid sketch and user references
    const query = { 
      text: { $exists: true, $ne: '' },
      sketch: { $ne: null },
      user: { $ne: null }
    };

    const sortOption = sortBy === 'oldest' 
      ? { createdAt: 1 } 
      : { createdAt: -1 };

    const reviews = await Review.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('user', 'username')
      .populate('sketch', 'title thumbnails')
      .lean();

    // Filter out any reviews where population failed
    const validReviews = reviews.filter(review => 
      review && review.sketch && review.user
    );

    const totalReviews = await Review.countDocuments(query);

    res.json({
      reviews: validReviews,
      currentPage: page,
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});
// app.get('/api/reviews', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 12;
//     const sortBy = req.query.sortBy || 'newest';
//     const skip = (page - 1) * limit;

//     // Only get reviews that have text
//     const query = { text: { $exists: true, $ne: '' } };

//     const sortOption = sortBy === 'oldest' 
//       ? { createdAt: 1 } 
//       : { createdAt: -1 };

//     const reviews = await Review.find(query)
//       .sort(sortOption)
//       .skip(skip)
//       .limit(limit)
//       .populate('user', 'username')
//       .populate('sketch', 'title thumbnails')
//       .lean();

//     const totalReviews = await Review.countDocuments(query);

//     res.json({
//       reviews,
//       currentPage: page,
//       totalPages: Math.ceil(totalReviews / limit),
//       totalReviews
//     });
//   } catch (error) {
//     console.error('Error fetching reviews:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

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
        .populate('user', 'username photoUrl');
        
      res.status(201).json(populatedReview);
    } catch (error) {
      console.error('Review creation error:', error);
      res.status(400).json({ error: error.message });
    }
  });
  
  app.get('/api/sketches/:id/reviews', async (req, res) => {
    try {
      const reviews = await Review.find({ sketch: req.params.id })
        // .populate('user', 'username')
        .populate({
          path: 'user',
          select: 'username photoUrl' // adding photo url
        })
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

 
app.put('/api/users/favorites', auth, async (req, res) => {
  try {
    const { favoriteSketchIds } = req.body;
    
    // Validate max 4 favorites
    if (favoriteSketchIds.length > 4) {
      return res.status(400).json({ error: 'Maximum 4 favorites allowed' });
    }

    const user = await User.findById(req.userId);
    user.favoriteSketchIds = favoriteSketchIds;
    await user.save();

    // Return populated favorites
    const updatedUser = await User.findById(req.userId)
      .populate('favoriteSketchIds')
      .populate('following')
      .populate('followers')
      .select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile with populated favorites
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('favoriteSketchIds')
      .populate('following', 'username')  // Add this
      .populate('followers', 'username')  // Add this 
      .populate('following', 'username photoUrl')  // Added photoUrl
      .populate('followers', 'username photoUrl')  // Added photoUrl
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// app.get('/api/users', async (req, res) => {
//   try {
//     const users = await User.find()
//       .select('-password -email') // Don't send sensitive info
//       .sort('-followers') // Sort by follower count
//       .lean();

//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'user',
          as: 'reviews'
        }
      },
      {
        $project: {
          username: 1,
          photoUrl: 1, // adding photo url
          favoriteSketchIds: 1,
          reviews: 1, // adding thefull reviews arary
          reviewCount: { $size: '$reviews' }
        }
      },
      { $sort: { reviewCount: -1 } }
    ]);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:id/follow', auth, async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const [currentUser, userToFollow] = await Promise.all([
      User.findById(req.userId),
      User.findById(req.params.id)
    ]);

    const isFollowing = currentUser.following.includes(req.params.id);
    
    if (isFollowing) {
      currentUser.following.pull(req.params.id);
      userToFollow.followers.pull(req.userId);
    } else {
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.userId);
    }

    await Promise.all([currentUser.save(), userToFollow.save()]);
    
    res.json({ isFollowing: !isFollowing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// app.get('/api/activity', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.userId);
    
//     const activity = await Review.find({
//       user: { $in: user.following },
//     })
//     .sort('-createdAt')
//     .populate('user', 'username')
//     .populate('sketch', 'title thumbnails')
//     .limit(20)
//     .lean();

//     res.json(activity);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.get('/api/activity', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get all reviews from followed users, not just ones with text
    const activity = await Review.find({
      user: { $in: user.following }
    })
    .sort('-createdAt')
    .populate('user', 'username')
    .populate('sketch', 'title thumbnails')
    .limit(70)
    .lean();

    // Filter out any activities with missing related data
    const validActivity = activity.filter(item => 
      item && item.user && item.sketch && 
      item.sketch.thumbnails && item.sketch.thumbnails.length > 0
    );

    res.json(validActivity);
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ error: error.message });
  }
});

// app.get('/api/activity', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.userId);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 12;
//     const skip = (page - 1) * limit;
    
//     // Get total count for pagination
//     const totalCount = await Review.countDocuments({
//       user: { $in: user.following }
//     });

//     // Get paginated activity
//     const activity = await Review.find({
//       user: { $in: user.following }
//     })
//     .sort('-createdAt')
//     .skip(skip)
//     .limit(limit)
//     .populate('user', 'username')
//     .populate('sketch', 'title thumbnails')
//     .lean();

//     // Filter out any activities with missing related data
//     const validActivity = activity.filter(item => 
//       item && item.user && item.sketch && 
//       item.sketch.thumbnails && item.sketch.thumbnails.length > 0
//     );

//     res.json({
//       activity: validActivity,
//       currentPage: page,
//       totalPages: Math.ceil(totalCount / limit),
//       totalItems: totalCount
//     });
//   } catch (error) {
//     console.error('Error fetching activity feed:', error);
//     res.status(500).json({ error: error.message });
//   }
// });


// bio?
// app.put('/api/users/profile', auth, async (req, res) => {
//   try {
//     const { bio, website } = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.userId,
//       { bio, website },
//       { new: true }
//     ).select('-password');
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

//bio
app.put('/api/users/profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...req.body },
      { new: true }
    )
    .populate('favoriteSketchIds')
    .populate('followers')
    .populate('following')
    .select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.delete('/api/reviews/:reviewId', auth, async (req, res) => {
  try {
    // Find the review
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if the logged-in user owns this review
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Delete the review
    await Review.findByIdAndDelete(req.params.reviewId);

    // Recalculate average rating for the sketch
    const remainingReviews = await Review.find({ sketch: review.sketch });
    const newAvgRating = remainingReviews.length > 0
      ? remainingReviews.reduce((acc, curr) => acc + curr.rating, 0) / remainingReviews.length
      : null;

    // Update the sketch's average rating
    await Sketch.findByIdAndUpdate(review.sketch, { 
      averageRating: newAvgRating ? newAvgRating.toFixed(1) : null 
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
});


// adding pinned reviews:
app.patch('/api/reviews/:reviewId/pin', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to pin this review' });
    }

    // If trying to pin, check count
    if (!review.pinned) {
      const pinnedCount = await Review.countDocuments({
        user: req.userId,
        pinned: true
      });

      if (pinnedCount >= 2) {
        return res.status(400).json({ error: 'You can only pin up to 2 reviews' });
      }
    }

    review.pinned = !review.pinned;
    await review.save();

    // Return populated review
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'username photoUrl')
      .populate('sketch', 'title thumbnails videoId');
    
    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get presigned URL for upload
app.get('/api/users/photo-upload-url', auth, async (req, res) => {
  try {
    const key = `profile-photos/${req.userId}-${Date.now()}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: 'image/jpeg'
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ uploadUrl, key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// app.post('/api/users/photo', auth, upload.single('photo'), async (req, res) => {
//   console.log('Photo upload request received');
  
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Upload to S3
//     const key = `profile-photos/${req.userId}-${Date.now()}`;
//     const command = new PutObjectCommand({
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: key,
//       Body: req.file.buffer,
//       ContentType: req.file.mimetype
//     });

//     await s3Client.send(command);
    
//     // Generate the URL
//     const photoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//     // Update user in database
//     const user = await User.findByIdAndUpdate(
//       req.userId,
//       { 
//         photoUrl,
//         photoKey: key // Store S3 key for deletion later
//       },
//       { new: true }
//     ).select('-password');

//     console.log('Photo upload successful:', {
//       userId: req.userId,
//       photoUrl: user.photoUrl
//     });

//     res.json(user);
//   } catch (error) {
//     console.error('Photo upload error:', error);
//     res.status(500).json({ error: 'Failed to upload photo' });
//   }
// });

app.post('/api/users/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Photo must be smaller than 5MB' });
    }

    // Check file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Please select a photo file (JPG, PNG, or WebP)'});
    }

    // Upload to S3...
    const key = `profile-photos/${req.userId}-${Date.now()}`;
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      });
      await s3Client.send(command);
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error);
      return res.status(500).json({ error: 'Unable to upload photo to storage. Please try again.' });
    }

    // Generate URL and update user...
    const photoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        photoUrl,
        photoKey: key
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to upload photo. Please try again.'
    });
  }
});

// Add delete photo endpoint
app.delete('/api/users/photo', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.photoKey) {
      try {
        console.log('Attempting to delete photo with key:', user.photoKey);
        const command = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: user.photoKey
        });
        await s3Client.send(command);
        console.log('Successfully deleted from S3');
      } catch (s3Error) {
        console.error('S3 deletion error:', s3Error);
        // Continue even if S3 delete fails - we still want to remove from DB
      }
    }

    // Update user regardless of S3 status
    user.photoUrl = null;
    user.photoKey = null;
    await user.save();
    
    console.log('Successfully updated user record');
    res.json(user);
  } catch (error) {
    console.error('Photo deletion error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});




app.get('/api/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('favoriteSketchIds')
      .populate('following')
      .populate('followers')
      .select('-password'); // Exclude password from the response
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
});


//LISTS

// Create list
app.post('/api/lists', auth, async (req, res) => {
  try {
    const { title, description, isRanked, entries } = req.body;
    
    const list = new List({
      user: req.userId,
      title,
      description,
      isRanked,
      entries: entries.map(entry => ({
        sketchId: entry.sketchId,
        notes: entry.notes,
        position: entry.position
      }))
    });

    await list.save();

    // Return populated list
    const populatedList = await List.findById(list._id)
      .populate('entries.sketchId', 'title thumbnails');

    res.status(201).json(populatedList);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's lists
app.get('/api/users/:userId/lists', async (req, res) => {
  try {
    const lists = await List.find({ user: req.params.userId })
      .populate('entries.sketchId', 'title thumbnails')
      .sort('-createdAt');

    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete list
app.delete('/api/lists/:listId', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this list' });
    }

    await list.deleteOne();
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: error.message });
  }
});


// Get single list
app.get('/api/lists/:listId', async (req, res) => {
  try {
    const list = await List.findById(req.params.listId)
      .populate('user', 'username photoUrl')
      .populate('entries.sketchId', 'title thumbnails');

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update list
app.put('/api/lists/:listId', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this list' });
    }

    const { title, description, isRanked, entries } = req.body;
    
    Object.assign(list, {
      title,
      description,
      isRanked,
      entries: entries.map(entry => ({
        sketchId: entry.sketchId,
        notes: entry.notes,
        position: entry.position
      }))
    });

    await list.save();

    // Return populated list
    const updatedList = await List.findById(list._id)
      .populate('user', 'username')
      .populate('entries.sketchId', 'title thumbnails');

    res.json(updatedList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Save/unsave a list
app.post('/api/lists/:listId/save', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check if user has already saved this list
    const savedIndex = list.savedBy.indexOf(req.userId);
    
    if (savedIndex === -1) {
      // Save the list
      list.savedBy.push(req.userId);
      list.saveCount = list.savedBy.length;
      await list.save();
      res.json({ saved: true, saveCount: list.saveCount });
    } else {
      // Unsave the list
      list.savedBy.pull(req.userId);
      list.saveCount = list.savedBy.length;
      await list.save();
      res.json({ saved: false, saveCount: list.saveCount });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's saved lists
app.get('/api/users/:userId/saved-lists', async (req, res) => {
  try {
    const lists = await List.find({ savedBy: req.params.userId })
      .populate('user', 'username')
      .populate('entries.sketchId', 'title thumbnails')
      .sort('-createdAt');
    
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modify your existing get list endpoint to include saved status for the requesting user
app.get('/api/lists/:listId', async (req, res) => {
  try {
    const list = await List.findById(req.params.listId)
      .populate('user', 'username')
      .populate('entries.sketchId', 'title thumbnails');

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Add saved status if user is authenticated
    const userId = req.headers.authorization ? 
      jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET).userId : 
      null;

    const responseList = list.toObject();
    responseList.isSaved = userId ? list.savedBy.includes(userId) : false;
    responseList.saveCount = list.savedBy.length;

    res.json(responseList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all lists with filtering, sorting, and pagination
app.get('/api/lists', async (req, res) => {
  try {
    const { 
      page = 1, 
      sortBy = 'newest',
      search = '',
      limit = 12
    } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Determine sort order
    let sortOrder = {};
    switch (sortBy) {
      case 'popular':
        sortOrder = { saveCount: -1, createdAt: -1 };
        break;
      case 'oldest':
        sortOrder = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortOrder = { createdAt: -1 };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [lists, totalCount] = await Promise.all([
      List.find(query)
        .populate('user', 'username')
        .populate('entries.sketchId', 'title thumbnails')
        .sort(sortOrder)
        .skip(skip)
        .limit(parseInt(limit)),
      List.countDocuments(query)
    ]);

    // Add saved status if user is authenticated
    const userId = req.headers.authorization ? 
      jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET).userId : 
      null;

    const enhancedLists = lists.map(list => {
      const listObj = list.toObject();
      listObj.isSaved = userId ? list.savedBy.includes(userId) : false;
      listObj.saveCount = list.savedBy.length;
      return listObj;
    });

    res.json({
      lists: enhancedLists,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html')); 
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
