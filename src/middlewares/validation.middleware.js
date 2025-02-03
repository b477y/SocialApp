import joi from "joi";
import { Types } from "mongoose";
import { genderTypes } from "../db/models/User.model.js";

export const isValidObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("In-valid object Id");
};

export const generalFields = {
  username: joi.string().min(2).max(50).trim(),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi
    .string()
    .regex(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmationPassword: joi.string().valid(joi.ref("password")),
  DOB: joi.date().less("now"),
  gender: joi
    .string()
    .valid(...Object.values(genderTypes))
    .insensitive(true),
  phoneNumber: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  address: joi.string(),
  OTP: joi.string().pattern(new RegExp(/^\d{4}$/)),
  id: joi.string().custom(isValidObjectId),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const inputs = { ...req.body, ...req.query, ...req.params };
    const validationResult = schema.validate(inputs, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).json({
        message: "Validation error",
        details: validationResult.error.details,
      });
    }
    return next();
  };
};
