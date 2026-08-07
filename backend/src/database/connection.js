import mongoose from 'mongoose';
import { env } from '../config/env.js';

/**
 * Establishes the connection to MongoDB via Mongoose.
 * The process exits on failure since the app cannot serve requests
 * without a working database connection.
 */
export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`[database] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[database] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[database] MongoDB disconnected');
});
