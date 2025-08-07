import mongoose from 'mongoose';

/**
 * Mongoose Schema for the Quote model.
 * Defines the data structure for each quote document.
 */
const QuoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please provide the quote text.'],
    trim: true,
  },
  author: {
    type: String,
    trim: true,
    default: 'Anonymous',
  },
}, {
  timestamps: true,
});

/**
 * This prevents Mongoose from compiling the model more than once.
 */
export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
