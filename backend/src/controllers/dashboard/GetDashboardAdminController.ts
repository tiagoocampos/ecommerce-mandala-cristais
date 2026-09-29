import { Request, Response } from "express";
import { GetDashboardAdminService } from "../../services/dashboard/GetDashboardAdminService.js";

class GetDashboardAdminController {
    async handle(req: Request, res: Response) {
        const getDashboardAdminService = new GetDashboardAdminService();
        const dashboard = await getDashboardAdminService.execute();

        return res.json(dashboard);
    }
}

export { GetDashboardAdminController };
