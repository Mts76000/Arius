import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongoUrl);
}

export async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
