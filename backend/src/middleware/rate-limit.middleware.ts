import rateLimit from 'express-rate-limit';
import { ProviderFactory } from '../config/providers.config';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Sent as JSON so clients can show it like any other API error
const tooManyRequests = (message: string) => ({ error: message });

// Failed sign-ins per client IP. Successful ones don't count, so a busy shared
// network (a school or office) isn't locked out by its own learners signing in.
// The portal signs users in from its server, which forwards the client's IP.
export const loginRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 20,
  skipSuccessfulRequests: true,
  message: tooManyRequests('Too many sign-in attempts, please try again in a few minutes'),
  standardHeaders: true,
  legacyHeaders: false,
});

// New accounts per client IP
export const registerRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 30,
  message: tooManyRequests('Too many accounts created from this network, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Public course content and certificate verification, per client IP
export const publicRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 1000,
  message: tooManyRequests('Too many requests, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Signed-in learners get a budget each, keyed by account rather than IP, so
// learners sharing a network (or a mobile carrier's NAT) don't share one.
// Runs before authenticate, which looks the learner up in the database: the
// token's signature alone identifies the learner, so requests over the limit
// cost no query, and a forged token can't spend a real learner's budget
// (requests without a valid token are counted per IP instead).
export const learnerRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 600,
  keyGenerator: (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    const learnerId = token ? ProviderFactory.getAuthProvider().getTokenSubject(token) : null;
    return learnerId ? `learner:${learnerId}` : `ip:${req.ip}`;
  },
  message: tooManyRequests('Too many requests, please wait a moment and try again'),
  standardHeaders: true,
  legacyHeaders: false,
});
