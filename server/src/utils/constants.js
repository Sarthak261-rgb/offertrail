// Board order. The client keeps a mirror of these in client/src/utils/constants.js.
export const STATUSES = ['wishlist', 'applied', 'interview', 'offer', 'rejected'];

/** Statuses that mean the search for this role is over: no follow-ups needed. */
export const CLOSED_STATUSES = ['offer', 'rejected'];

/** Reaching any of these means the company responded positively. */
export const INTERVIEW_STATUSES = ['interview', 'offer'];

export const SOURCES = ['linkedin', 'referral', 'company-site', 'job-board', 'other'];

export const PRIORITIES = ['low', 'medium', 'high'];

export const SORT_OPTIONS = ['-appliedAt', 'appliedAt', 'company', '-company', '-updatedAt'];
