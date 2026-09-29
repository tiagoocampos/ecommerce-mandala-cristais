import { Request, Response } from "express";
import { GetUserAdminService } from "../../../services/user/admin/GetUserAdminService.js";

class GetUserAdminController {
  async handle(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    const getUserAdminService = new GetUserAdminService();
    const user = await getUserAdminService.execute({ id });

    return res.json(user);
  }
}

export { GetUserAdminController };
