const mongoose = require('mongoose');

/**
 * Interaction Schema representing a timeline event (note, call, meeting)
 * associated with a specific customer.
 */
const interactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Interaction must be linked to a customer'],
    },
    type: {
      type: String,
      enum: {
        values: ['call', 'email', 'meeting', 'note'],
        message: '{VALUE} is not a supported interaction type',
      },
      default: 'note',
    },
    content: {
      type: String,
      required: [true, 'Interaction content is required'],
      trim: true,
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
    },
  },
  { timestamps: true }
);

// Optimize query performance for loading interaction timelines
interactionSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
