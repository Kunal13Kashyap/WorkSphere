import { ZodError } from "zod";
import AppError from "../utils/appError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {

        const errors = error.issues.map((err)=> ({
          field: err.path[0],
          message: err.message
        }));

        return next(
          new AppError("Validation failed", 400, errors)
        );
      }
      next(error);
    }
  };
};