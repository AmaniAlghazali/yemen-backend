import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- FIXED: Capturing the return object into 'result' ---
const result = dotenv.config({ path: path.resolve(__dirname, "./.env") });

if (result.error) {
  if (result.error.code === "ENOENT") {
    console.log("No .env file found — using environment variables (Vercel or system).");
  } else {
    console.log("Dotenv Error:", result.error.message);
  }
} else {
  console.log("Dotenv successfully read your .env file!");
}