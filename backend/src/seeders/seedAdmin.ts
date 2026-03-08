import 'dotenv/config';
import { connectDB } from '../config/db';
import User from '../models/User';

const seedAdmin = async () => {
  await connectDB();

  const email = 'admin@shopv1.com';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  await User.create({
    name: 'Admin',
    email,
    password: 'admin123',
    role: 'admin',
    refreshTokens: [],
  });

  console.log('Admin created:', email);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
