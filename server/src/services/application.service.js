import { Application } from '../models/Application.js';
import { AppError } from '../utils/AppError.js';
import { CLOSED_STATUSES } from '../utils/constants.js';

// Lightweight projection for the board and follow-up panel.
const CARD_FIELDS = 'company role location status priority source appliedAt followUpAt updatedAt';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Every lookup goes through this helper so ownership is always enforced.
// Another user's document is reported as 404 to avoid revealing that it exists.
async function findOwned(userId, id) {
  const application = await Application.findOne({ _id: id, user: userId });
  if (!application) throw new AppError(404, 'Application not found');
  return application;
}

export async function listApplications(userId, { q, status, source, priority, sort, page, limit }) {
  const filter = { user: userId };
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (priority) filter.priority = priority;
  if (q) {
    // Per-user data is small, so a case-insensitive regex gives partial matches
    // ("goo" → "Google") which a text index would not.
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ company: pattern }, { role: pattern }];
  }

  const [items, total] = await Promise.all([
    Application.find(filter)
      .sort(`${sort} -_id`)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-statusHistory -notes')
      .lean(),
    Application.countDocuments(filter),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export function getBoard(userId) {
  return Application.find({ user: userId }).sort('-updatedAt').select(CARD_FIELDS).lean();
}

export function getDueFollowUps(userId, now = new Date()) {
  const endOfToday = new Date(now);
  endOfToday.setUTCHours(23, 59, 59, 999);

  return Application.find({
    user: userId,
    followUpAt: { $lte: endOfToday },
    status: { $nin: CLOSED_STATUSES },
  })
    .sort('followUpAt')
    .select(CARD_FIELDS)
    .lean();
}

export function getApplication(userId, id) {
  return findOwned(userId, id);
}

export function createApplication(userId, data) {
  return Application.create({ ...data, user: userId });
}

export async function updateApplication(userId, id, changes) {
  const application = await findOwned(userId, id);
  application.set(changes);
  return application.save();
}

export async function deleteApplication(userId, id) {
  const deleted = await Application.findOneAndDelete({ _id: id, user: userId });
  if (!deleted) throw new AppError(404, 'Application not found');
}
