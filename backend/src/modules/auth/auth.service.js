import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import UserModel from "./auth.model.js";
import OrgModel from "../organization/organization.model.js";
import InviteModel from "../organization/invite.model.js";
import TokenModel from "./token.model.js";

import AppError from "../../utils/appError.js";
import { generateToken } from "../../utils/token.js";
import { logAudit } from "../audit/audit.logger.js";

export const signupService = async ({ email, password, orgName, ip }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@") || normalizedEmail.startsWith("@") || normalizedEmail.endsWith("@")) throw new AppError("Invalid email", 400);

    if(!orgName || orgName.trim().length < 3) throw new AppError("Organization name required",400);
    const normalizedOrgName = orgName.trim().toLowerCase();

    const existingOrg = await OrgModel.findOne({
        name: normalizedOrgName
    });
    if(existingOrg) throw new AppError("Organization already exists",409);

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if(existingUser) throw new AppError("User already exists, go to Login",409);

    if(!password || password.length < 8) throw new AppError("Password is required",400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const session = await mongoose.startSession();

    let newUser;

    try{
        session.startTransaction();

        newUser = new UserModel({
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin",
        });

        const newOrg = new OrgModel({ 
            name: normalizedOrgName,
            createdBy: newUser._id
        },);

        newUser.belongsTo = newOrg._id;

        await newUser.save({session});
        await newOrg.save({session});
        await session.commitTransaction();
    } catch(error){
        await session.abortTransaction();
        if(error instanceof AppError){
            throw error;
        }
        throw new AppError("Signup failed",500);
    } finally {
        session.endSession();
    }

    const token = generateToken(newUser);

    await logAudit({
        action: "SIGNUP",
        actor: newUser._id,
        status: "success",
        ip
    })

    return token;
}

export const signupWithInvite = async ({ email, password, inviteId, ip }) => {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await UserModel.findOne({ 
        email: normalizedEmail 
    });
    if (existingUser) throw new AppError("User already exists",409);

    if (!mongoose.Types.ObjectId.isValid(inviteId)) throw new AppError("Invalid invite ID",400);

    const isInvited = await InviteModel.findById(inviteId);

    if (!isInvited) throw new AppError("Invalid or already used invite", 400);
    if (isInvited.status !== "pending") throw new AppError("Invite already used",400);
    if(isInvited.email.toLowerCase() !== normalizedEmail) throw new AppError("Email mismatch",400);

    const hashedPassword = await bcrypt.hash(password,10);

    const invitedUser = new UserModel({
        email: normalizedEmail,
        password: hashedPassword,
        role: isInvited.role,
        belongsTo: isInvited.orgId
    });

    await invitedUser.save();

    isInvited.status = "accepted";
    await isInvited.save();

    const token = generateToken(invitedUser);

    await logAudit({
        action: "SIGNUP_WITH_INVITE",
        actor: invitedUser._id,
        metadata: {
            invitedBy: isInvited.invitedBy,
            orgId: isInvited.orgId
        },
        status: "success",
        ip
    })

    return token;

}

export const loginService = async ({ email, password, ip }) => {
    const normalizedEmail = email.toLowerCase();

    const user = await UserModel.findOne({ email: normalizedEmail });
    if(!user) throw new AppError("Invalid email or password",401);
    
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid) throw new AppError("Invalid email or password",401);

    const token = generateToken(user);

    await logAudit({
        action: "LOGIN",
        actor: user._id,
        status: "success",
        ip
    })

    return token;
}

export const logoutService = async ({ token, decoded, ip })=>{
    await TokenModel.updateOne(
        { token },
        { 
            $setOnInsert: { 
                token, 
                expiresAt: new Date(decoded.exp * 1000) 
            } 
        },
        { upsert: true }
    );
    const user = decoded;

    await logAudit({
        action: "LOGOUT",
        actor: decoded._id,
        metadata: {
            blacklistToken: token
        },
        status: "success",
        ip
    })
}