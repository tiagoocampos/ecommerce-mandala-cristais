declare class ListUsersAdminService {
    execute(): Promise<{
        name: string;
        email: string;
        phone: string | null;
        id: string;
        role: import("../../../generated/prisma/enums.js").Role;
        marketing_opt_out: boolean;
        createdAt: Date;
        _count: {
            orders: number;
        };
    }[]>;
}
export { ListUsersAdminService };
//# sourceMappingURL=ListUsersAdminService.d.ts.map