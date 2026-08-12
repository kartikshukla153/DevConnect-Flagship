const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
];

const optionalEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "OPENROUTER_API_KEY",
  "GEMINI_API_KEY",
];

export function validateEnvironment() {
  const missingRequired = requiredEnv.filter(
    (key) => !process.env[key]
  );

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingRequired.join(", ")}`
    );
  }

  const missingOptional = optionalEnv.filter(
    (key) => !process.env[key]
  );

  if (missingOptional.length > 0) {
    console.warn(
      `⚠️ Optional environment variables not configured: ${missingOptional.join(
        ", "
      )}`
    );
  }
}

export function getEnv(key, fallback = undefined) {
  const value = process.env[key];

  if (value !== undefined && value !== "") {
    return value;
  }

  return fallback;
}