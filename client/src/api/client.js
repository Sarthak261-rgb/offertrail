import axios from 'axios';

/** Normalised API error: every failed request rejects with one of these. */
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data?.error;
    const fallback = status ? 'Request failed' : 'Cannot reach the server. Check your connection.';
    return Promise.reject(new ApiError(body?.message ?? fallback, status, body?.details));
  },
);

/** Server validation details are { field: [messages] }; forms show the first message per field. */
export const fieldErrorsFrom = (error) =>
  Object.fromEntries(
    Object.entries(error?.details ?? {}).map(([field, messages]) => [field, messages?.[0]]),
  );

/** Unwraps the `{ data }` envelope used by every endpoint. */
export const unwrap = (response) => response.data.data;
