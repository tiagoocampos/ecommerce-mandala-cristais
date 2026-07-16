import { Request, Response } from 'express';
import { CreateAddressService } from '../../services/address/CreateAddressService.js';

class CreateAddressController {
    async handle(req: Request, res: Response){
        const user_id = req.user_id

        const { street, number, complement, city, state, neighborhood, zip_code } = req.body;

        const createAddress = new CreateAddressService();
        const address = await createAddress.execute({ user_id, street, number, complement, city, state, neighborhood, zip_code });
        return res.json(address);
    }
}

export { CreateAddressController }