import express from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/rbac.middleware.js";
import { ROLES } from "../../utils/roles.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { taskSchema, taskUpdateSchema } from "../../validations/index.js";
import { taskUpdateController, taskGetController, taskCreateController, taskStatusUpdateController, taskDeleteController } from "./task.controller.js";

const router = express.Router();

router.post("/",auth,authorizeRoles(ROLES.ADMIN,ROLES.MANAGER),validate(taskSchema),taskCreateController);

router.get("/",auth,authorizeRoles(ROLES.ADMIN,ROLES.MANAGER,ROLES.MEMBER),taskGetController);

router.patch("/:taskId",auth,authorizeRoles(ROLES.ADMIN,ROLES.MANAGER),validate(taskUpdateSchema),taskUpdateController);

router.patch("/:taskId/status",auth,authorizeRoles(ROLES.ADMIN,ROLES.MANAGER,ROLES.MEMBER),taskStatusUpdateController);

router.delete("/:taskId",auth,authorizeRoles(ROLES.ADMIN),taskDeleteController);

export default router;