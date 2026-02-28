import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  refreshTokens: Array<{
    token: string;
    device: string;
    expiresAt: Date;
  }>;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    avatar: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        device: { type: String, required: true },
        expiresAt: { type: Date, required: true },
      },
    ],
    passwordResetToken: String,
    passwordResetExpiry: Date,
  },
  { timestamps: true }
);

// Pre-save hook: hash password + clean expired tokens
userSchema.pre('save', async function () {
  // Hash password only if modified
  if (this.isModified('password')) {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  }

  // Clean expired refresh tokens
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.expiresAt > now);
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
