import rateLimit from "express-rate-limit";

/**
 * ============================================================
 * DevConnect Rate Limiting
 * ============================================================
 *
 * Design:
 * - Normal application traffic gets a generous limiter.
 * - Authentication is deliberately strict.
 * - AI endpoints are deliberately strict because they are
 *   computational / provider-cost intensive.
 * - Uploads have their own limiter.
 *
 * IMPORTANT:
 * We intentionally do NOT use skipSuccessfulRequests globally.
 * Successful requests are still real traffic and should count.
 */

const createRateLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
  skipSuccessfulRequests = false,
  skipFailedRequests = false,
} = {}) => {
  return rateLimit({
    windowMs,
    max,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    skipSuccessfulRequests,
    skipFailedRequests,

    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message,
        retryAfter:
          res.getHeader("Retry-After") || null,
      });
    },
  });
};

/**
 * ============================================================
 * GENERAL API LIMITER
 * ============================================================
 *
 * This is intentionally generous.
 *
 * A dashboard can legitimately make several requests during
 * initialization. We do not want normal application navigation
 * to behave like an abuse scenario.
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,

  message:
    "Too many API requests. Please slow down and try again.",
});

/**
 * ============================================================
 * AUTHENTICATION LIMITER
 * ============================================================
 *
 * Login / register / password-related endpoints should remain
 * considerably stricter.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,

  message:
    "Too many authentication attempts. Please try again later.",
});

/**
 * ============================================================
 * AI LIMITER
 * ============================================================
 *
 * AI requests can consume external provider resources, so this
 * remains much stricter than ordinary API traffic.
 */
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,

  message:
    "Too many AI requests. Please wait a moment and try again.",
});

/**
 * ============================================================
 * UPLOAD LIMITER
 * ============================================================
 */
export const uploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,

  message:
    "Too many upload requests. Please try again later.",
});

/**
 * ============================================================
 * OPTIONAL SPECIALIZED READ LIMITER
 * ============================================================
 *
 * Useful later for high-frequency endpoints such as:
 * - search
 * - feeds
 * - activity
 *
 * We are exporting it now so the architecture is ready,
 * but we don't need to attach it everywhere immediately.
 */
export const readRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300,

  message:
    "Too many read requests. Please slow down and try again.",
});

/**
 * ============================================================
 * OPTIONAL WRITE LIMITER
 * ============================================================
 *
 * Useful later for endpoints that create:
 * - posts
 * - comments
 * - connections
 * - tasks
 * - messages
 *
 * This gives us finer-grained protection than one global
 * limiter.
 */
export const writeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,

  message:
    "Too many write requests. Please slow down and try again.",
});

export default createRateLimiter;