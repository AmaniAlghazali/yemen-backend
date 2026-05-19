import crypto from "crypto";
const resetToken = crypto.randomBytes(20).toString("hex");
const hashedToken = crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex");
console.log(hashedToken);
//y520nf8Pqsc5ItTI