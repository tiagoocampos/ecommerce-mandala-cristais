import { Request, Response } from "express";
import { NoShippingOptionsError } from "../../exceptions/ShippingErrors.js";
import { ShippingQuoteService } from "../../services/shipping/ShippingQuoteService.js";

class ShippingQuoteController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;
        const { address_id } = req.body;

        const shippingQuoteService = new ShippingQuoteService();
        try {
            return res.json(await shippingQuoteService.execute({ user_id, address_id }));
        } catch (error) {
            // Nenhuma opção válida: mantém o 422, mas devolve também PAC/SEDEX indisponíveis
            // para o frontend listá-los (e oferecer a retirada, se ativa)
            if (error instanceof NoShippingOptionsError) {
                const unavailable = (error as NoShippingOptionsError & { unavailable?: unknown }).unavailable ?? [];
                return res.status(error.statusCode).json({ error: error.message, options: [], unavailable });
            }
            throw error;
        }
    }
}

export { ShippingQuoteController };
