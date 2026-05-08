import mongoose from "mongoose";
import AppError from "../../utils/appError.js";
import TaskModel from "../task/task.model.js";
import ProjectModel from "../project/project.model.js";
import UserModel from "../auth/auth.model.js";
import { logAudit } from "../audit/audit.logger.js";
import { TASK_STATUS } from "../../utils/constants.js";
import { STATUS_TRANSITIONS } from "../../utils/transition.js";
import { buildFilter } from '../../utils/queryBuilder.js'

export const taskCreateService = async ({ projectId, assignedTo, title, description, user, ip }) => {
    const userId = user.userId;
    const orgId = user.orgId;

    if(!orgId) throw new AppError("User is not the part of any organization",400);

    const project = await ProjectModel.findOne({
        _id: projectId, 
        orgId 
    }).lean();
    if (!project) throw new AppError("Project not found", 404);

    const assignee = await UserModel.findOne({
        _id: assignedTo, 
        belongsTo: orgId 
    }).lean();
    if (!assignee) throw new AppError("Assigned user not in org", 400);

    const newTask = await TaskModel.create({
        title: title.trim(),
        description: description?.trim(),
        assignedTo,
        projectId,
        orgId,
        createdBy: userId
    });

    await logAudit({
        action: "TASK_CREATED",
        actor: userId,
        metadata: {
            projectId,
            orgId
        },
        status: "success",
        ip
    })

    return newTask;
};

export const taskGetService = async ({ projectId, user, status, assignedTo, page, limit, query }) => {
    const orgId = user.orgId;
    if (!orgId) throw new AppError("User is not part of any organization", 400);

    const project = await ProjectModel.findOne({
        _id: projectId, 
        orgId
    }).lean();
    if (!project) throw new AppError("Project not found", 404);

    const skip = (page - 1) * limit;

    const baseFilter = {
        projectId,
        orgId,
        isArchived: false
    };

    const filter = buildFilter( baseFilter, query, ["status"], ["title"] );

    if (status && !TASK_STATUS.includes(status)) throw new AppError("Invalid status filter", 400);

    if (user.role === "member") {
        filter.assignedTo = user.userId;
    } else if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
        filter.assignedTo = assignedTo;
    }

    const [tasks, total] = await Promise.all([
        TaskModel
        .find(filter)
        .select("title status assignedTo createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

        TaskModel.countDocuments(filter)
    ])

    return {
        data: tasks,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total/limit)
        }
    };
};

export const taskUpdateService = async ({ taskId, user, detailObject, ip }) => {
    const orgId = user.orgId;

    if (!orgId) {
        throw new AppError("User not part of any organization", 400);
    }

    if(!detailObject || Object.keys(detailObject).length === 0){
        throw new AppError("No fields to update",400);
    }
    
    const task = await TaskModel.findOne({
        _id: taskId, 
        orgId, 
        isArchived: false
    });

    if(!task) throw new AppError("Task not found",404);

    Object.assign(task, detailObject);
    await task.save();

    await logAudit({
        action: "TASK_UPDATED",
        actor: user.userId,
        target: taskId,
        metadata: {
            orgId,
            updatedDetails: detailObject
        },
        status: "success",
        ip
    })

    return task;
};

export const taskStatusUpdateService = async ({ taskId, status, user, ip }) => {

    if (!TASK_STATUS.includes(status)) throw new AppError("Invalid status value", 400);

    const orgId = user.orgId;

    if (!orgId) throw new AppError("User not part of any organization", 400);

    const task = await TaskModel.findOne({
        _id: taskId, 
        orgId, 
        isArchived: false 
    });

    if (!task) throw new AppError("Task not found", 404);

    const currentStatus = task.status;

    if(currentStatus === status) throw new AppError("Task already in this status",400);
    if(currentStatus === "done") throw new AppError("Completed task can't be modified",400);
    if (!STATUS_TRANSITIONS[currentStatus]) throw new AppError("Invalid current task state", 500);

    const allowedNext = STATUS_TRANSITIONS[currentStatus] || [];

    if(!allowedNext.includes(status)) throw new AppError(`Invalid transition from ${currentStatus} to ${status}`,400);

    if(user.role === "member"){
        const isOwner = task.assignedTo?.toString() === user.userId?.toString();
        if (!isOwner) throw new AppError("Not allowed to update status", 403);
    }
    
    task.status = status;

    if(status === "in_progress" && !task.startedAt) task.startedAt = new Date();
    if(status === "done") task.completedAt = new Date();

    await task.save();

    await logAudit({
        action: "TASK_STATUS_UPDATED",
        actor: user.userId,
        target: taskId,
        metadata: {
            orgId,
            beforeTaskStatus: currentStatus,
            afterTaskStatus: status
        },
        status: "success",
        ip
    })

    return task;
};

export const taskDeleteService = async ({ taskId, user, ip }) => {

    const orgId = user.orgId;

    if (!orgId) throw new AppError("User not part of any organization", 400);

    const deleteTask = await TaskModel.findOne({
        _id: taskId, 
        orgId, 
        isArchived: false
    });

    if (!deleteTask) throw new AppError("Task not found", 404);

    if (deleteTask.isArchived) throw new AppError("Task already deleted", 400);

    deleteTask.isArchived = true;
    await deleteTask.save();

    await logAudit({
        action: "TASK_DELETED",
        actor: user.userId,
        metadata: {
            taskId,
            orgId
        },
        status: "success",
        ip
    })

    return deleteTask;
};