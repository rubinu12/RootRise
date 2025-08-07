import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto'; // Import the crypto library to generate random keys

// --- 1. Define an Interface for the User Document ---
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phoneNo: string;
  role: 'paid' | 'admin';
  activeSessionKey?: string; // ADDED: The magic key to track the active session
  createdAt: Date;
  profilePicture?: string;
  targetExamYear?: number;
  lastLogin?: Date;
  // Method signatures
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

// --- 2. Define an Interface for the User Model ---
export interface IUserModel extends Model<IUser> {}

// --- 3. Create the Mongoose Schema ---
const UserSchema = new mongoose.Schema<IUser, IUserModel>({
  name: { type: String, required: [true, 'Please provide your name.'], trim: true },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address.'],
  },
  password: { type: String, required: [true, 'Please provide a password.'], minlength: 6, select: false },
  phoneNo: { type: String, required: [true, 'Please provide your phone number.'], match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number.'] },
  role: { type: String, enum: ['paid', 'admin'], default: 'paid' },
  activeSessionKey: { type: String, select: false }, // ADDED: It's not sent back on queries by default
  createdAt: { type: Date, default: Date.now },
  profilePicture: { type: String, default: '' },
  targetExamYear: { type: Number },
  lastLogin: { type: Date },
});

// --- 4. Define the Methods ---

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Also generate the first session key when the user is created
  if (this.isNew) {
      this.activeSessionKey = crypto.randomBytes(32).toString('hex');
  }
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign a JWT and return it
UserSchema.methods.getSignedJwtToken = function (): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
  }

  // UPDATED: The payload now includes the activeSessionKey
  const payload = { 
    id: this._id.toString(),
    key: this.activeSessionKey 
  };
  
  const options: SignOptions = {
    expiresIn: '30d',
  };

  return jwt.sign(payload, secret, options);
};

// --- 5. Export the Model ---
export default (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', UserSchema);
