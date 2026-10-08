import mongoose from 'mongoose';
import { PRIORITIES, SOURCES, STATUSES } from '../utils/constants.js';

const statusChangeSchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    changedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, required: true, trim: true, maxlength: 100 },
    location: { type: String, trim: true, maxlength: 100, default: '' },
    jobUrl: { type: String, trim: true, default: '' },
    salaryMin: { type: Number, min: 0, default: null },
    salaryMax: { type: Number, min: 0, default: null },
    source: { type: String, enum: SOURCES, default: 'linkedin' },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    status: { type: String, enum: STATUSES, default: 'applied' },
    appliedAt: { type: Date, default: Date.now },
    followUpAt: { type: Date, default: null },
    notes: { type: String, maxlength: 5000, default: '' },
    // Written only by the hook below; the API never accepts it as input.
    statusHistory: { type: [statusChangeSchema], default: [] },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

// Every query is scoped by user, so user leads each compound index.
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, appliedAt: -1 });
applicationSchema.index({ user: 1, followUpAt: 1 });

applicationSchema.pre('validate', async function checkSalaryRange() {
  if (this.salaryMin != null && this.salaryMax != null && this.salaryMin > this.salaryMax) {
    this.invalidate('salaryMax', 'Maximum salary must be greater than or equal to the minimum');
  }
});

// Mongoose only marks `status` as modified when the value actually changes,
// so re-saving the same status does not add a duplicate history entry.
applicationSchema.pre('save', async function recordStatusChange() {
  if (this.isNew || this.isModified('status')) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
});

export const Application = mongoose.model('Application', applicationSchema);
