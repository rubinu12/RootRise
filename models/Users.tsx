// models/Users.tsx

// This interface defines the structure of a user's profile in your Firestore database.
export interface IUser {
  uid: string; // THIS IS THE FIX: Add the user's unique ID from Firebase Auth
  name: string;
  email: string;
  phoneNo: string;
  role: 'paid' | 'unpaid' | 'admin';
  createdAt: Date;
  profilePicture?: string;
  targetExamYear?: number;
  lastLogin?: Date;
}