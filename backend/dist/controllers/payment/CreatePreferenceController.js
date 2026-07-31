import { CreatePreferenceService } from '../../services/payment/CreatePreferenceService.js';
class CreatePreferenceController {
    async handle(req, res) {
        const user_id = req.user_id;
        const { order_id } = req.body;
        const createPreferenceService = new CreatePreferenceService();
        const payment = await createPreferenceService.execute({ order_id, user_id });
        return res.json(payment);
    }
}
export { CreatePreferenceController };
//# sourceMappingURL=CreatePreferenceController.js.map