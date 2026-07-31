import { DetailUserService } from '../../services/user/DetailUserService.js';
class DetailUserController {
    async handle(req, res) {
        const user_id = req.user_id;
        const detailUser = new DetailUserService();
        const user = await detailUser.execute(user_id);
        return res.json(user);
    }
}
export { DetailUserController };
//# sourceMappingURL=DetailUserController.js.map