import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

/*
 * ============================================================
 * CLOUDINARY CONFIGURATION
 * ============================================================
 *
 * dotenv/config is intentionally imported here so the
 * environment variables are available before Cloudinary
 * is configured.
 */

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "\n============================================================"
  );

  console.error(
    "CLOUDINARY CONFIGURATION ERROR"
  );

  console.error(
    "Missing one or more Cloudinary environment variables:"
  );

  console.error(
    `CLOUDINARY_CLOUD_NAME: ${
      cloudName ? "OK" : "MISSING"
    }`
  );

  console.error(
    `CLOUDINARY_API_KEY: ${
      apiKey ? "OK" : "MISSING"
    }`
  );

  console.error(
    `CLOUDINARY_API_SECRET: ${
      apiSecret ? "OK" : "MISSING"
    }`
  );

  console.error(
    "============================================================\n"
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;