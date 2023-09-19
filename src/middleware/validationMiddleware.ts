import { NextFunction, Request, Response } from "express";
import { fromZodError } from "zod-validation-error";
import * as z from "zod";
import { CustomAPIError } from "../errors";

export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // parse in accordance to schema. If does not fit schema, throw error
      schema.parse(req.body);
      return next();
    } catch (e) {
      // can only type check errors with type guards
      if (e instanceof z.ZodError) {
        // library that makes readable zod message
        const validationError = fromZodError(e);
        throw new CustomAPIError(validationError.message, 400);
      }
    }
  };
}
