import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './Users'; // Assuming IUser is exported from your User model

// --- 1. Define an Interface for the TestResult Document ---
export interface ITestResult extends Document {
  userId: IUser['_id'];
  quizTitle: string;
  questions: mongoose.Types.ObjectId[];
  userAnswers: {
    questionId: string;
    answer: string;
  }[];
  score: {
    correctCount: number;
    incorrectCount: number;
    unattemptedCount: number;
    finalScore: number;
    maxScore: number;
  };
  createdAt: Date;
}

// --- 2. Define an Interface for the TestResult Model ---
export interface ITestResultModel extends Model<ITestResult> {}

// --- 3. Create the Mongoose Schema ---
const TestResultSchema = new Schema<ITestResult, ITestResultModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizTitle: {
    type: String,
    required: true,
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question',
  }],
  userAnswers: [{
    questionId: String,
    answer: String,
  }],
  score: {
    correctCount: Number,
    incorrectCount: Number,
    unattemptedCount: Number,
    finalScore: Number,
    maxScore: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- 4. Export the Model ---
export default (mongoose.models.TestResult as ITestResultModel) || mongoose.model<ITestResult, ITestResultModel>('TestResult', TestResultSchema);