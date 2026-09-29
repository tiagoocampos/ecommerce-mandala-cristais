import { Request, Response } from "express";
import { UpdateStoreSettingsService } from "../../services/storeSettings/UpdateStoreSettingsService.js";

class UpdateStoreSettingsController {
    async handle(req: Request, res: Response) {
        const { announcement_text, announcement_coupon_code, free_shipping_threshold, trust_strip_items } = req.body;

        const updateStoreSettingsService = new UpdateStoreSettingsService();
        const settings = await updateStoreSettingsService.execute({
            announcement_text,
            announcement_coupon_code,
            free_shipping_threshold,
            trust_strip_items,
        });

        return res.json(settings);
    }
}

export { UpdateStoreSettingsController };
