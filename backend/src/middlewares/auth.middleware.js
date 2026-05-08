import jwt from "jsonwebtoken";

import AppError from "../utils/appError.js";
import UserModel from "../modules/auth/auth.model.js";
import TokenModel from "../modules/auth/token.model.js";

import { JWT_SECRET } from "../config/env.js";

export const auth = async(req,res,next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        throw new AppError("Access token missing",401);
    }

    if (!authHeader.startsWith("Bearer ")) {
        throw new AppError("Invalid token format", 401);
    }

    const token = authHeader.split(" ")[1];
    req.token = token;

    try{
        const decodedData = jwt.verify(token,JWT_SECRET);

        const isBlacklisted = await TokenModel.exists({token});
        if(isBlacklisted) throw new AppError("Invalid or expired token",401);

        const user = await UserModel.findById(decodedData.userId).select("_id role belongsTo").lean();
        if (!user) throw new AppError("User not found", 404);

        req.decoded = decodedData;
        
        req.user = {
            userId: user._id,
            orgId: user.belongsTo,
            role: user.role
        };
        next();

    }catch(error){
        if (error instanceof AppError) return next(error);
        return next(new AppError("Invalid or expired token", 401));
    }
}