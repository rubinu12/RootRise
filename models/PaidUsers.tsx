import mongoose from 'mongoose';

const PaidUserSchema = new mongoose.Schema({
  // This creates a direct link to the main User model. It's the key to connecting the two.
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // This will store the IDs of all questions a paid user has bookmarked.
  bookmarkedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question', 
  }],
  // This will store the IDs of all "Daily Dose" articles a paid user has bookmarked.
  bookmarkedDoses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyDose', // We will create this model later
  }],
  // This section can be expanded later to integrate with a payment provider like Stripe or Razorpay.
  subscription: {
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime'],
      required: true,
    },
    planEndDate: {
      type: Date,
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.PaidUser || mongoose.model('PaidUser', PaidUserSchema);
