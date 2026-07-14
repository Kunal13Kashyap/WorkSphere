import express from "express"
import { auth } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/rbac.middleware.js";
import { ROLES } from "../../utils/roles.js";
import { projectPostController, projectGetController, projectByidGetController, projectChangeController, projectDeleteController } from "./project.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { projectSchema, projectUpdateSchema } from "../../validations/project.validation.js";

const router = express.Router();

router.post("/",auth,authorizeRoles(ROLES.ADMIN,ROLES.MANAGER),validate(projectSchema),projectPostController);

router.get("/",auth,authorizeRoles(ROLES.ADMIN,ROLES.MANAGER,ROLES.MEMBER),projectGetController);

router.get("/:projectId",auth,authorizeRoles(ROLES.ADMIN,ROLES.MANAGER,ROLES.MEMBER),projectByidGetController);

router.patch("/:projectId",auth,authorizeRoles(ROLES.ADMIN,ROLES.MANAGER),validate(projectUpdateSchema),projectChangeController);

router.delete("/:projectId",auth,authorizeRoles(ROLES.ADMIN),projectDeleteController);

export default router;