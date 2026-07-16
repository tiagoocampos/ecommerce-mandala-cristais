import { Request, Response } from "express";
import { DeleteUserAdminService } from "../../../services/user/admin/DeleteUserAdminService.js";

class DeleteUserAdminController {
  async handle(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    const deleteUserAdminService = new DeleteUserAdminService();
    const result = await deleteUserAdminService.execute({ id });

    return res.json(result);
  }
}

export { DeleteUserAdminController };

