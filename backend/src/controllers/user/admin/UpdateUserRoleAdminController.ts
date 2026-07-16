import { Request, Response } from "express";
import { UpdateUserRoleAdminService } from "../../../services/user/admin/UpdateUserRoleAdminService.js";

class UpdateUserRoleAdminController {
  async handle(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { role } = req.body as { role: "STAFF" | "ADMIN" };

    const updateUserRoleAdminService = new UpdateUserRoleAdminService();
    const user = await updateUserRoleAdminService.execute({ id, role });

    return res.json(user);
  }
}

export { UpdateUserRoleAdminController };

