import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- FIXED: Capturing the return object into 'result' ---
const result = dotenv.config({ path: path.resolve(__dirname, "./.env") });

console.log("--- DOTENV DIAGNOSTIC ---");
if (result.error) {
  console.log("Dotenv Error:", result.error.message);
} else {
  console.log("Dotenv successfully read your .env file!");
}
console.log("CLOUDINARY_API_KEY in memory:", process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING (undefined)");
console.log("-------------------------");