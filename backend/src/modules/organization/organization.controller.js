import mongoose from "mongoose";

import { inviteService, roleUpdateService } from "./organization.service.js";
import { ROLES } from "../../utils/roles.js";
import AppError from "../../utils/appError.js";

export const inviteController = async ( req, res, next ) => {
    try{
        const userEmail = req.body.email;
        const orgId = req.user.orgId;
    
        const inviteId = await inviteService({
            userEmail,
            orgId,
            invitedBy: req.user.userId,
            ip: req.ip
        });
        return res.status(201).json({
            message: "Invited Successfully",
            inviteId: inviteId
        });
    }
    catch(error){
        next(error);
    };
    
}

export const roleUpdateController = async ( req, res, next ) => {
    try{
        const { userId } = req.params;
        const adminOrgId = req.user.orgId;
        
        if(!mongoose.Types.ObjectId.isValid(userId)) throw new AppError("Invalid UserId",400);

        const { role = "member" } = req.body;

        if (!Object.values(ROLES).includes(role)) throw new AppError("Invalid role",400);

        if(userId.toString() === req.user.userId.toString() && role !== ROLES.ADMIN) throw new AppError("Admin cannot change own role",400);

        const updateUserRole = await roleUpdateService({
            targetUserId: userId, 
            adminOrgId, 
            userUpdatedRole: role, 
            updatedBy: req.user.userId, 
            ip: req.ip, 
            oldRole: role
        });

        return res.status(200).json({
            message: "Role updated successfully",
            userId: updateUserRole._id,
            role: updateUserRole.role
        })

    } catch(error){
        next(error)
    }

}