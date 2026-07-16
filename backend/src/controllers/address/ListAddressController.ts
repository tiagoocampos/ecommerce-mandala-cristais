import { Request, Response } from 'express';
import { ListAddressService } from '../../services/address/ListAddressService.js';



class ListAddressController {
    async handle(req: Request, res: Response) {
        const user_id  = req.user_id
        const listAddressService = new ListAddressService();
        const addresses = await listAddressService.execute({
            user_id: user_id
        });

        return res.json(addresses);
    }
}

export { ListAddressController };