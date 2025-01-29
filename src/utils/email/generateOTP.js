import { customAlphabet } from "nanoid";
import { generateHash } from "../security/hash.security.js";

const generateOTP = () => {
  const OTP = customAlphabet("0123456789", 4)();
  const hashedOTP = generateHash({ plaintext: OTP });
  return { OTP, hashedOTP };
};

export default generateOTP;
