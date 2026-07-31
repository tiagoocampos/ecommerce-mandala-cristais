import { UpdateUserRoleAdminService } from "../../../services/user/admin/UpdateUserRoleAdminService.js";
class UpdateUserRoleAdminController {
    async handle(req, res) {
        const { id } = req.params;
        const { role } = req.body;
        const updateUserRoleAdminService = new UpdateUserRoleAdminService();
        const user = await updateUserRoleAdminService.execute({ id, role });
        return res.json(user);
    }
}
export { UpdateUserRoleAdminController };
//# sourceMappingURL=UpdateUserRoleAdminController.js.map