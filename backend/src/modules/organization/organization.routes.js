import express from "express";
import { inviteController, roleUpdateController } from "./organization.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/rbac.middleware.js";
import { ROLES } from "../../utils/roles.js";
import { inviteSchema } from "../../validations/index.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = express.Router();

router.post("/invite",auth,authorizeRoles(ROLES.ADMIN),validate(inviteSchema),inviteController);

router.patch("/users/:userId",auth,authorizeRoles(ROLES.ADMIN),roleUpdateController);

export default router;