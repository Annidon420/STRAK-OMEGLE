import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  interests: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  bio: Joi.string().max(200).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const reportSchema = Joi.object({
  reportedUserId: Joi.string().required(),
  roomId: Joi.string().required(),
  reason: Joi.string().min(10).max(500).required(),
});

export const updateReportStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "reviewed", "resolved").required(),
});