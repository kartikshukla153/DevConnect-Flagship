import rateLimit from "express-rate-limit";

const createRateLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
  skipSuccessfulRequests = false,
} = {}) => {
  return rateLimit({
    windowMs,
    max,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    skipSuccessfulRequests,

    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message,
      });
    },
  });
};

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests. Please slow down and try again.",
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many authentication attempts. Please try again later.",
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message:
    "Too many AI requests. Please wait a moment and try again.",
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message:
    "Too many upload requests. Please try again later.",
});

export default createRateLimiter;