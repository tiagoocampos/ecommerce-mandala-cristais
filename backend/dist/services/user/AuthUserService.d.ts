interface AuthUserProps {
    email: string;
    password: string;
}
declare class AuthUserService {
    execute({ email, password }: AuthUserProps): Promise<{
        id: string;
        name: string;
        email: string;
        role: import("../../generated/prisma/enums.js").Role;
        token: string;
    }>;
}
export { AuthUserService };
//# sourceMappingURL=AuthUserService.d.ts.map