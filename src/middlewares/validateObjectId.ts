import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

export const validateObjectId = (req: Request,res:Response,next: NextFunction) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        return res.status(400).json({message: "Invalid ID"});
    }
    next();
}