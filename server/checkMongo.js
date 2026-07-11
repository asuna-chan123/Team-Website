require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Connecting to:', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('Connected!');
    
    // Get list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:');
    for (let col of collections) {
      console.log(`- ${col.name}`);
      const sample = await mongoose.connection.db.collection(col.name).findOne();
      console.log('  Sample doc:', JSON.stringify(sample, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
