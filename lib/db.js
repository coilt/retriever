// db.js
import mongoose from 'mongoose';

const uri = 'mongodb://localhost:27017';
const dbName = 'iostore';

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(uri, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedConnection = connection;

    console.log('Connected to MongoDB');

    return connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default connectToDatabase;
