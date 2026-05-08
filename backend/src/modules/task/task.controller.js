import { taskCreateService, taskGetService, taskUpdateService, taskStatusUpdateService, taskDeleteService } from "./task.service.js";
import AppError from "../../utils/appError.js";

export const taskCreateController = async ( req, res, next ) => {
    try{
        const { projectId, assignedTo, title, description } = req.body;

        if (!projectId || typeof projectId !== "string") throw new AppError("Project ID is required", 400);
        if(!assignedTo) throw new AppError("Assigned user is required",400);

        const task = await taskCreateService({
            projectId,
            assignedTo,
            title,
            description,
            user: req.user,
            ip: req.ip
        });

        res.status(201).json({
            success: true,
            message: "Task successfully created",
            data: task
        })
    } catch(error){
        next(error);
    }
};

export const taskGetController = async ( req, res, next ) => {
    try{
        let {projectId, status, assignedTo, page = 1, limit = 10} = req.query;

        if (!projectId) throw new AppError("Project ID is required", 400);

        page = parseInt(page);
        limit = parseInt(limit);

        if(isNaN(page) || page < 1) page = 1;
        if(isNaN(limit) || limit < 1) limit = 10;

        limit = Math.min(limit, 50);
        
        const getTasks = await taskGetService({
            projectId, 
            user: req.user, 
            status, 
            assignedTo,
            page,
            limit,
            query: req.query
        });

        res.status(200).json({
            message: "Tasks fetched successfully",
            data: getTasks.data,
            pagination: getTasks.pagination
        });
    } catch(error){
        next(error);
    }
};

export const taskUpdateController = async ( req, res, next ) => {
    try{
        const {title, description} = req.body;
        const {taskId} = req.params;

        const isValidString = (value) => typeof value === "string" && value.trim() !== "";

        if (title === undefined && description === undefined) throw new AppError("At least one field is required", 400);
        if (title !== undefined && !isValidString(title)) throw new AppError("Title can't be empty",400);
        if (description !== undefined && !isValidString(description)) throw new AppError("Description can't be empty",400);

        const detailObject = {};
        if (title !== undefined) detailObject.title = title.trim();
        if (description !== undefined) detailObject.description = description.trim();

        if (!taskId) throw new AppError("Task ID is required", 400);
        
        const taskUpdate = await taskUpdateService({
            taskId,
            user: req.user,
            detailObject,
            ip: req.ip
        });

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: taskUpdate
        });
    } catch(error){
        next(error)
    }
};

export const taskStatusUpdateController = async ( req, res, next ) => {
    try{
        const { taskId } = req.params;
        const { status } = req.body;

        if (status === undefined) throw new AppError("Status is required", 400);
        if (!taskId) throw new AppError("Task ID is required", 400);

        const updatedTask = await taskStatusUpdateService({
            taskId,
            status,
            user: req.user,
            ip: req.ip
        });

        res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            data: updatedTask
        });

    } catch(error){
        next(error);
    }
};

export const taskDeleteController = async ( req, res, next ) => {
    try{
        const {taskId} = req.params;

        if (!taskId) throw new AppError("Task ID is required", 400);

        await taskDeleteService({
            taskId,
            user: req.user,
            ip: req.ip
        });

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch(error){
        next(error);
    }
};