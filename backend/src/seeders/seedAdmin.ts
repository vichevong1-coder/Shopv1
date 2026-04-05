import 'dotenv/config';
import { connectDB } from '../config/db';
import User from '../models/User';

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;

  if (!password) {
    console.error('ADMIN_PASSWORD env var is required');
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  await User.create({
    name,
    email,
    password,
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
