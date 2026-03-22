import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';

async function drop() {
  await mongoose.connect(process.env.MONGO_URI!);
  const result = await mongoose.connection.collection('products').deleteMany({});
  console.log(`✅ Deleted ${result.deletedCount} products`);
  await mongoose.disconnect();
}

drop().catch((err) => {
  console.error('💥', err.message);
  process.exit(1);
});
