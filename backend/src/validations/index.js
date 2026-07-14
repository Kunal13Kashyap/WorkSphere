// this folder contains zod validation Schemas

import { loginSchema, signupSchema, signupWithInviteSchema } from "./auth.validation.js";
import { inviteSchema } from "./organization.validation.js";
import { projectSchema, projectUpdateSchema } from "./project.validation.js";
import { taskSchema, taskUpdateSchema } from "./task.validation.js";

export {
    loginSchema,
    signupSchema,
    signupWithInviteSchema,
    inviteSchema,
    projectSchema,
    projectUpdateSchema,
    taskSchema,
    taskUpdateSchema
}