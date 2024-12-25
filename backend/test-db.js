// explore-db.js
require('dotenv').config();
const mongoose = require('mongoose');

async function exploreDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully\n');

    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('📚 Available Databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // For each database, list collections
    for (const db of dbs.databases) {
      const database = mongoose.connection.client.db(db.name);
      const collections = await database.listCollections().toArray();
      
      if (collections.length > 0) {
        console.log(`\n📁 Collections in ${db.name}:`);
        for (const collection of collections) {
          const count = await database.collection(collection.name).countDocuments();
          console.log(`- ${collection.name} (${count} documents)`);
          
          // Show a sample document from each collection
          if (count > 0) {
            const sample = await database.collection(collection.name).findOne();
            console.log('  Sample document:', JSON.stringify(sample, null, 2).slice(0, 200) + '...');
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

exploreDatabase();