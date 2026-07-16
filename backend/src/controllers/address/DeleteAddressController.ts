import { Request, Response } from 'express';
import { DeleteAddressService } from '../../services/address/DeleteAddressService.js';

class DeleteAddressController {
    async handle(req: Request, res: Response) {
        const address_id = req.query.address_id as string;
        const user_id = req.user_id;

        const deleteAddressService = new DeleteAddressService();
        const result = await deleteAddressService.execute({
            id: address_id,
            user_id: user_id
        });

        return res.json(result);
    }
}

export { DeleteAddressController };