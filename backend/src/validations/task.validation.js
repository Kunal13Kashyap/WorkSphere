import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const taskSchema = z.object({
    title: z.string().trim().min(4,"Title is too small").max(50,"Title is too large"),
    description: z.string().max(500,"Exceeding the desciption limit").optional(),
    projectId: objectId,
    assignedTo: objectId
});

export const taskUpdateSchema = z.object({
    title: z.string().trim().min(4).max(50).optional(),
    description: z.string().max(500).optional(),
    assignedTo: objectId.optional()
});