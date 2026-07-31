interface CreateUserProps {
    name: string;
    email: string;
    password: string;
    phone?: string | null;
}
declare class CreateUserService {
    execute({ name, email, password, phone }: CreateUserProps): Promise<{
        name: string;
        email: string;
        phone: string | null;
        id: string;
        role: import("../../generated/prisma/enums.js").Role;
        createdAt: Date;
    }>;
}
export { CreateUserService };
//# sourceMappingURL=CreateUserService.d.ts.map