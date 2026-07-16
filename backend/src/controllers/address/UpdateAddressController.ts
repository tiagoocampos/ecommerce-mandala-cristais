import { Request, Response } from 'express';
import { UpdateAddressService } from '../../services/address/UpdateAddressService.js';

class UpdateAddressController {
    async handle(req: Request, res: Response) {
        const address_id = req.query.address_id as string;
        const user_id = req.user_id;
        const { street, number, complement, neighborhood, city, state, zip_code } = req.body;

        const updateAddressService = new UpdateAddressService();
        const address = await updateAddressService.execute({ user_id, street, number, complement, neighborhood, city, state, zip_code, id: address_id });

        return res.json(address);
    }
}

export { UpdateAddressController };