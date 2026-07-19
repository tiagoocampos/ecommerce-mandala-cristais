import {Request, Response} from 'express';

import { GetOrCreateCartService } from '../../services/cart/GetOrCreateCartService.js';

class GetOrCreateCartController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;
        if (!user_id) {
            throw new Error("User id is required");
        }
        const getOrCreateCartService = new GetOrCreateCartService();
        const cart = await getOrCreateCartService.execute({ user_id });

        return res.json(cart);
    }
}

export { GetOrCreateCartController };