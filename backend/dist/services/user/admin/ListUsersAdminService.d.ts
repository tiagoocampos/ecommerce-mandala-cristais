declare class ListUsersAdminService {
    execute(): Promise<{
        name: string;
        email: string;
        id: string;
        role: import("../../../generated/prisma/enums.js").Role;
        createdAt: Date;
    }[]>;
}
export { ListUsersAdminService };
//# sourceMappingURL=ListUsersAdminService.d.ts.map