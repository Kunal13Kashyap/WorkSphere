import ProjectModel from "./project.model.js";
import AppError from "../../utils/appError.js";
import { buildFilter } from "../../utils/queryBuilder.js";
import { logAudit } from "../audit/audit.logger.js";

export const projectPostService = async ({ name, description, user, ip }) => {
    const userId = user.userId;
    const orgId = user.orgId;

    if (!orgId) {
        throw new AppError("User is not part of any organization", 400);
    }

    try {
        const newProject = await ProjectModel.create({
            name: name.trim(),
            description: description?.trim() || "",
            orgId,
            ownerId: userId,
            createdBy: userId
        });

        await logAudit({
            action: "PROJECT_CREATED",
            actor: userId,
            metadata: {
                projectId: newProject._id,
                orgId
            },
            status: "success",
            ip
        })

        return newProject;

    } catch (error) {
        if (error.code === 11000) throw new AppError("Project with this name already exists", 400);
        throw error;
    }
};

export const projectGetService = async ({ orgId, page, limit, query}) => {
    if (!orgId) {
        throw new AppError("User is not part of any organization", 400);
    }

    const skip = (page-1) * limit;

    const baseFilter = {
        orgId,
        isDeleted: false
    }
    const filter = buildFilter(baseFilter, query, ["status", "ownerId"]);

    const [projects, total] = await Promise.all([
    ProjectModel
        .find(filter)
        .select("name description status createdAt ownerId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

        ProjectModel.countDocuments(filter)
    ]);

    return {
        data: projects,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total/limit)
        }            
    };
};

export const projectByidGetService = async ({ projectId, orgId }) => {
    if (!orgId) {
        throw new AppError("User is not part of any organization", 400);
    }
    if(!projectId) {
        throw new AppError("Invalid Id",400);
    }

    const getProject = await ProjectModel.findOne({
        _id: projectId, 
        orgId, 
        isDeleted: false
    });
    if(!getProject){
        throw new AppError("Not found",404);
    }
    return getProject;
};

export const projectChangeService = async ({ projectId, orgId, detailObject, updatedBy, ip }) => {
    if (!orgId) {
        throw new AppError("User is not part of any organization", 400);
    }
    if(!projectId) {
        throw new AppError("Invalid Id",400);
    }

    if(!detailObject || Object.keys(detailObject).length === 0){
        throw new AppError("No fields to update",400);
    }

    try {
        const updateProject = await ProjectModel.findOneAndUpdate(
            {
                _id: projectId,
                orgId,
                isDeleted: false
            },
            {
                $set: detailObject
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updateProject) throw new AppError("Project not found",404);

        await logAudit({
            action: "PROJECT_UPDATED",
            actor: updatedBy,
            metadata: {
                updatedDetails: detailObject,
                projectId: updateProject._id,
                orgId
            },
            status: "success",
            ip
        })

        return updateProject;

    } catch(error) {

        if (error.code === 11000) {
            throw new AppError("Project with this name already exists",400);
        }

        throw error;
    }
};

export const projectDeleteService = async ({ projectId, orgId, deletedBy, ip }) => {
    if (!orgId) {
        throw new AppError("User is not part of any organization", 400);
    }
    if(!projectId) {
        throw new AppError("Invalid Id",400);
    }
    const deletedProject = await ProjectModel.findOneAndUpdate({
        _id: projectId, 
        orgId, 
        isDeleted: false
    },{
        $set: {
            isDeleted: true, 
            deletedAt: new Date()}
    },{
        new: true, 
        runValidators: true
    });

    if(!deletedProject) throw new AppError("Project not found",404);

    await logAudit({
        action: "PROJECT_DELETED",
        actor: deletedBy,
        metadata: {
            projectId,
            orgId
        },
        status: "success",
        ip
    });

    return deletedProject;
};

export const deleteOldProjectsService = async () => {
    const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await ProjectModel.deleteMany({
    isDeleted: true,
    deletedAt: { 
        $exists: true, 
        $lt: THIRTY_DAYS_AGO
        }
    });
};