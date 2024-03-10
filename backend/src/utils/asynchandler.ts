import { controllerType } from "../types/types.js";
import { NextFunction,Request,Response } from "express";


const asyncHandler =
  (func: controllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
};

export {asyncHandler};