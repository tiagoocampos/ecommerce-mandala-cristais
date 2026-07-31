import { compare } from "bcrypt";
import prismaClient from "../../prisma/index.js";
import jwt from "jsonwebtoken";
import { PasswordNotMatchError } from "../../exceptions/passwordNotMatch.js";
import { UserNotFoundError } from "../../exceptions/UserErrors.js";
class AuthUserService {
    async execute({ email, password }) {
        const user = await prismaClient.user.findFirst({
            where: {
                email: email
            }
        });
        if (!user) {
            throw new UserNotFoundError();
        }
        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
            throw new PasswordNotMatchError();
        }
        const token = jwt.sign({
            name: user.name,
            email: user.email,
        }, process.env.JWT_SECRET, { subject: user.id, expiresIn: "30d" });
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        };
    }
}
export { AuthUserService };
//# sourceMappingURL=AuthUserService.js.map