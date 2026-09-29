import { Request, Response } from "express";
import { GetStoreSettingsService } from "../../services/storeSettings/GetStoreSettingsService.js";

class GetStoreSettingsController {
    async handle(req: Request, res: Response) {
        const getStoreSettingsService = new GetStoreSettingsService();
        const settings = await getStoreSettingsService.execute();

        return res.json(settings);
    }
}

export { GetStoreSettingsController };
