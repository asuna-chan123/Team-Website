const mongoose = require('mongoose');

let localConnection;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected (Cloud): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  try {
    localConnection = mongoose.createConnection(process.env.MONGODB_URI_LOCAL);
    localConnection.on('connected', () => {
      console.log('MongoDB Connected (Local) successfully');
    });
    localConnection.on('error', (err) => {
      console.error(`MongoDB Connected (Local) Error: ${err.message}`);
    });
  } catch (err) {
    console.error(`MongoDB Connected (Local) Init Error: ${err.message}`);
  }
};

module.exports = connectDB;
module.exports.getLocalConnection = () => localConnection;
