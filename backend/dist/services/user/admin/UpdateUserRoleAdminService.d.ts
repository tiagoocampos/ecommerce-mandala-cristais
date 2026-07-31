declare class UpdateUserRoleAdminService {
    execute({ id, role }: {
        id: string;
        role: "STAFF" | "ADMIN";
    }): Promise<{
        name: string;
        email: string;
        password: string;
        phone: string | null;
        id: string;
        role: import("../../../generated/prisma/enums.js").Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export { UpdateUserRoleAdminService };
//# sourceMappingURL=UpdateUserRoleAdminService.d.ts.map