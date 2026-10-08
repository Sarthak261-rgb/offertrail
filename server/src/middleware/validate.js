import { AppError } from '../utils/AppError.js';

/**
 * Validates request parts against Zod schemas, e.g. validate({ body: schema, params: schema }).
 * Parsed (coerced, defaulted) values go to req.validated, because Express 5 makes req.query read-only.
 */
export const validate = (schemas) => (req, _res, next) => {
  req.validated = {};

  for (const [part, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[part] ?? {});
    if (!result.success) {
      const { fieldErrors, formErrors } = result.error.flatten();
      const details = formErrors.length > 0 ? { ...fieldErrors, _form: formErrors } : fieldErrors;
      throw new AppError(400, 'Validation failed', details);
    }
    req.validated[part] = result.data;
  }

  next();
};
