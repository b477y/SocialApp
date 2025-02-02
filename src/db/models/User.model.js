import mongoose, { Schema, model } from "mongoose";

export const genderTypes = { male: "male", female: "female" };
export const roleTypes = { user: "user", admin: "admin" };
export const providerTypes = { google: "Google", system: "System" };

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    confirmEmailOTP: String,
    resetPasswordOTP: String,
    otpCreatedAt: {
      type: Date,
      default: Date.now,
    },
    otpAttempts: { type: Number, default: 0, max: 5 },
    password: {
      type: String,
      required: (data) => {
        return data?.provider === providerTypes.google ? false : true;
      },
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: (data) => {
        return data?.provider === providerTypes.google ? false : true;
      },
    },
    address: String,
    DOB: Date,
    image: String,
    coverImages: [String],
    gender: {
      type: String,
      enum: Object.values(genderTypes),
      default: genderTypes.male,
    },
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.user,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.system,
    },
    changeCredentialsTime: Date,
  },
  { timestamps: true }
);

export const userModel = mongoose.models.User || model("User", userSchema);
