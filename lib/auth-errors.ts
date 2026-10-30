// Error code passed from NextAuth's authorize() to the sign-in pages when the
// backend can't be reached, so users aren't told their password is wrong.
export const AUTH_UNAVAILABLE = 'ServiceUnavailable';

// Error code for when the backend refuses a sign-in for too many failed attempts
export const AUTH_RATE_LIMITED = 'RateLimited';
