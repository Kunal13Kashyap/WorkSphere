import { signupWithInvite, signupService, loginService, logoutService } from "./auth.service.js";

export const signupWithInviteController = async ( req, res, next ) => {
    try{
        const token = await signupWithInvite({
            email: req.body.email,
            password: req.body.password,
            inviteId: req.body.inviteId,
            ip: req.ip
        });
        
        return res.status(201).json({
            success: true,
            message: "Signed Up successfully",
            token
        });
    }catch(error){
        next(error);
    }
}

export const signupController = async ( req, res, next ) => {
    try{ 
        const token = await signupService({
            email: req.body.email, 
            password: req.body.password,
            ip: req.ip
        });
        
        res.status(201).json({
            success: true,
            message: "User created successfully",
            token
        });
    }
    catch(error){
        next(error);
    };
}

export const loginController = async ( req, res, next ) => {
    try{
        const token = await loginService({
            email: req.body.email,
            password: req.body.password,
            ip: req.ip
        });

        return res.status(200).json({
            success: true,
            message: "Token generated successfully",
            token
        });

    }catch(err){
        next(err);
    }
}

export const logoutController = async ( req, res, next ) => {
    try{
        if (!req.token || !req.decoded) {
            throw new AppError("Unauthorized", 401);
        }
        await logoutService({
            token: req.token,
            decoded: req.decoded,
            ip: req.ip
        });
        
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch(error){
        next(error)
    }
}