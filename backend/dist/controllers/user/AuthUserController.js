import { AuthUserService } from '../../services/user/AuthUserService.js';
class AuthUserController {
    async handle(req, res) {
        const { email, password } = req.body;
        const authUserService = new AuthUserService();
        const session = await authUserService.execute({ email, password });
        res.json(session);
    }
}
export { AuthUserController };
//# sourceMappingURL=AuthUserController.js.map