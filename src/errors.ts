import { NextFunction, Request, Response } from "express";

export function asyncErrorHandler(fn: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

// create custom error class that has status code and message
export class CustomAPIError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = "CustomAPIError";
  }
}

export function errorHandler(
  err: Error | CustomAPIError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.name === "CustomAPIError") {
    const customError = err as CustomAPIError;
    return res
      .status(customError.statusCode)
      .json({ message: customError.message });
  }
  res.status(500).json({ message: "something went wrong" });
}
