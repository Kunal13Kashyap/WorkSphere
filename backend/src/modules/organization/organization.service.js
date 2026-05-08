import UserModel from "../auth/auth.model.js";
import InviteModel from "./invite.model.js";
import AppError from "../../utils/appError.js";
import { logAudit } from "../audit/audit.logger.js";

export const inviteService = async ({ userEmail, orgId, invitedBy, ip }) => {
    if(!userEmail) throw new AppError("Email is required",400);

    const normalizedEmail = userEmail.trim().toLowerCase();

    const findUser = await UserModel.findOne({
        email: normalizedEmail,
        belongsTo: orgId
    });

    if(findUser){
        throw new AppError("User already exists",409);
    }

    const invitePending = await InviteModel.findOne({
        email: normalizedEmail,
        orgId: orgId,
        status: "pending"
    });

    if(invitePending) throw new AppError("Invitation of this user is in pending state",409);

    const newInvite = await InviteModel.create({
        email: normalizedEmail,
        orgId,
        invitedBy
    });

    await logAudit({
        action: "INVITE_USER",
        actor: invitedBy,
        target: newInvite._id,
        metadata: {
            invitedEmail: normalizedEmail,
            orgId
        },
        status: "success",
        ip
    })


    return newInvite._id;

};

export const roleUpdateService = async ({ targetUserId, adminOrgId, userUpdatedRole, updatedBy, ip, oldRole }) => {
    const updateRole = await UserModel.findOneAndUpdate({
        _id: targetUserId,
        belongsTo: adminOrgId,
        role: { $ne: userUpdatedRole }
    }, {
        role: userUpdatedRole
    }, { new: true, runValidators: true }).lean();

    if(!updateRole) throw new AppError("User not found in organization or role already assigned",404);

    await logAudit({
        action: "UPDATE_ROLE",
        actor: updatedBy,
        target: targetUserId,
        metadata: {
            oldRole,
            newRole: userUpdatedRole,
            orgId: adminOrgId
        },
        status: "success",
        ip
    })

    return updateRole;
}