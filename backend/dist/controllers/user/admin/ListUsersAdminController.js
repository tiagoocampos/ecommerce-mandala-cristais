import { ListUsersAdminService } from "../../../services/user/admin/ListUsersAdminService.js";
class ListUsersAdminController {
    async handle(req, res) {
        const listUsersAdminService = new ListUsersAdminService();
        const users = await listUsersAdminService.execute();
        return res.json(users);
    }
}
export { ListUsersAdminController };
//# sourceMappingURL=ListUsersAdminController.js.map