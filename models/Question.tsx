import mongoose from 'mongoose';

/**
 * Mongoose Schema for the Question model.
 * Defines the data structure, types, and validation rules for each question document.
 */
const QuestionSchema = new mongoose.Schema({
  // --- NEW FIELD ---
  exam: {
    type: String,
    required: [true, 'Please specify the exam for this question (e.g., UPSC CSE, CDS).'],
    trim: true,
    default: 'UPSC CSE', // Ensures existing questions are categorized
  },
  // --- NEWLY ADDED FIELD ---
  paperQuestionNumber: {
    type: Number,
  },
  
  questionText: {
    type: String,
    required: [true, 'Please provide the question text.'],
    trim: true,
  },
  optionA: {
    type: String,
    trim: true,
  },
  optionB: {
    type: String,
    trim: true,
  },
  optionC: {
    type: String,
    trim: true,
  },
  optionD: {
    type: String,
    trim: true,
  },
  correctOption: {
    type: String,
    enum: ['A', 'B', 'C', 'D', null, ''], 
    trim: true,
  },
  year: {
    type: Number,
  },
  subject: {
    type: String,
    trim: true,
  },
  topic: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', null, ''], 
    trim: true,
  },
  explanationText: {
    type: String,
    trim: true,
  },
  explanationPDF: {
    type: String,
  },
  image: {
    type: String,
  },
}, {
  timestamps: true,
});

/**
 * This prevents Mongoose from compiling the model more than once.
 */
export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);