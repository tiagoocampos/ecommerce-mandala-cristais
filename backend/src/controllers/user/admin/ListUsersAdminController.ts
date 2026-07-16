import { Request, Response } from "express";
import { ListUsersAdminService } from "../../../services/user/admin/ListUsersAdminService.js";

class ListUsersAdminController {
  async handle(req: Request, res: Response) {
    const listUsersAdminService = new ListUsersAdminService();
    const users = await listUsersAdminService.execute();
    return res.json(users);
  }
}

export { ListUsersAdminController };

