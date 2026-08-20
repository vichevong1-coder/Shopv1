import * as dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function inspect() {
  console.log('Connecting to MongoDB Atlas (READ ONLY)...');
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const collections = await db.listCollections().toArray();
  console.log(`\nFound ${collections.length} collections:`);

  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`- ${col.name.padEnd(20)}: ${count} documents`);
  }

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB.');
}

inspect().catch((err) => {
  console.error('Inspect error:', err);
  process.exit(1);
});
