import { z } from 'zod';
import { PRIORITIES, SORT_OPTIONS, SOURCES, STATUSES } from '../utils/constants.js';

// HTML forms send "" for an empty field; treat that as "no value".
const blankTo = (fallback) => (value) => (value === '' ? fallback : value);

const nullableDate = z.preprocess(blankTo(null), z.coerce.date().nullable());
const nullableSalary = z.preprocess(
  blankTo(null),
  z.coerce.number().int().min(0).max(10_000_000).nullable(),
);

const applicationFields = {
  company: z.string().trim().min(1, 'Company is required').max(100),
  role: z.string().trim().min(1, 'Role is required').max(100),
  location: z.string().trim().max(100),
  jobUrl: z.union([z.literal(''), z.string().trim().url('Enter a valid URL')]),
  salaryMin: nullableSalary,
  salaryMax: nullableSalary,
  source: z.enum(SOURCES),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES),
  appliedAt: z.coerce.date(),
  followUpAt: nullableDate,
  notes: z.string().max(5000),
};

const optionalFields = Object.fromEntries(
  Object.entries(applicationFields).map(([key, schema]) => [key, schema.optional()]),
);

// .strict() rejects unknown keys, so clients can never set `user` or `statusHistory`.
export const createApplicationSchema = z
  .object({ ...optionalFields, company: applicationFields.company, role: applicationFields.role })
  .strict();

export const updateApplicationSchema = z
  .object(optionalFields)
  .strict()
  .refine((body) => Object.keys(body).length > 0, 'Provide at least one field to update');

const optionalEnum = (values) => z.preprocess(blankTo(undefined), z.enum(values).optional());

export const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: optionalEnum(STATUSES),
  source: optionalEnum(SOURCES),
  priority: optionalEnum(PRIORITIES),
  sort: z.enum(SORT_OPTIONS).default('-appliedAt'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid application id'),
});
