const mongoose = require('mongoose');

const recognitionLogSchema = new mongoose.Schema(
  {
    usn: String,
    confidence: Number,
    status: {
      type: String,
      enum: ['recognized', 'unknown', 'no_face', 'error'],
      required: true,
    },
    facesDetected: { type: Number, default: 0 },
    sessionId: String,
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rawResponse: mongoose.Schema.Types.Mixed,
    recognizedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

recognitionLogSchema.index({ recognizedAt: -1 });
recognitionLogSchema.index({ usn: 1 });

module.exports = mongoose.model('RecognitionLog', recognitionLogSchema);
