import { DeleteUserAdminService } from "../../../services/user/admin/DeleteUserAdminService.js";
class DeleteUserAdminController {
    async handle(req, res) {
        const { id } = req.params;
        const deleteUserAdminService = new DeleteUserAdminService();
        const result = await deleteUserAdminService.execute({ id });
        return res.json(result);
    }
}
export { DeleteUserAdminController };
//# sourceMappingURL=DeleteUserAdminController.js.map