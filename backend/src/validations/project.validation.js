import { z } from "zod";

export const projectSchema = z.object({

    name: z.string().min(3).max(50).trim(),

    description: z.string().min(4).max(300).trim().optional(),
    
});

export const projectUpdateSchema = z.object({
    name: z.string().trim().min(3).max(50).optional(),
    description: z.string().max(500).optional()
});