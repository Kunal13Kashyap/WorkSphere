import { projectPostService, projectGetService, projectByidGetService, projectChangeService, projectDeleteService } from "./project.service.js";
import mongoose from "mongoose";
import AppError from "../../utils/appError.js";

export const projectPostController = async ( req, res, next ) => {
    try{
        const { name, description } = req.body;
        const createdProject = await projectPostService({
            name,
            description, 
            user: req.user, 
            ip: req.ip
        });

        res.status(201).json({
            message: "Project created successfully",
            data: createdProject
        });
    }
    catch(error){
        next(error);
    };
};

export const projectGetController = async ( req, res, next ) => {
    try{
        const orgId = req.user.orgId;

        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;

        limit = Math.min(limit, 50);

        const projects = await projectGetService({
            orgId, 
            page, 
            limit, 
            query: req.query
        });

        res.status(200).json({
            message: "Projects fetched successfully",
            data: projects.data,
            pagination: projects.pagination
        });
    }catch(error){
        next(error);
    }
};

export const projectByidGetController = async ( req, res, next ) => {
    try{
        const projectId = req.params.projectId;
        const orgId = req.user.orgId;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new AppError("Invalid project ID", 400);
        }
        const projectWanted = await projectByidGetService({projectId, orgId});

        res.status(200).json({
            message: 'Project fetched successfully',
            project: projectWanted
        })

    } catch(error){
        next(error);
    }
};

export const projectChangeController = async ( req, res, next ) => {
    try {
        const { name, description } = req.body;
        const projectId = req.params.projectId;
        const orgId = req.user.orgId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new AppError("Invalid project ID", 400);
        }

        const hasName = name !== undefined;
        const hasDescription = description !== undefined;

        if (!hasName && !hasDescription) throw new AppError("At least one field is required",400);
        if (hasName && (typeof name !== "string" || name.trim() === "")) throw new AppError("Name can't be empty",400);
        if (hasDescription && typeof description !== "string") throw new AppError("Description must be a string",400);

        const detailObject = {};

        if (hasName) detailObject.name = name.trim();
        if (hasDescription) detailObject.description = description.trim();

        const updateProject = await projectChangeService({
            projectId,
            orgId,
            detailObject,
            updatedBy: req.user.userId,
            ip: req.ip
        });

        return res.status(200).json({
            message: `Project: ${projectId} updated successfully`,
            project: updateProject
        });
    } catch (error) {
        next(error);
    }
};

export const projectDeleteController = async ( req, res, next ) => {
    try{
        const projectId = req.params.projectId;
        const orgId = req.user.orgId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new AppError("Invalid project ID", 400);
        }

        const deleteProject = await projectDeleteService({
            projectId,
            orgId, 
            deletedBy: req.user.userId, 
            ip: req.ip
        });

        res.status(200).json({
            message: `Project: ${projectId} deleted successfully`,
            project: deleteProject
        })
    } catch(error){
        next(error);
    }
};