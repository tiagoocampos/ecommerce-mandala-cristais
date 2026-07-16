import { compare } from "bcrypt";
import prismaClient from "../../prisma/index.js";
import jwt from "jsonwebtoken";
import { PasswordNotMatchError } from "../../exceptions/passwordNotMatch.js";
import { UserNotFoundError } from "../../exceptions/UserNotFoundError.js";

interface AuthUserProps {
    email: string;
    password: string;
}

class AuthUserService {
    async execute({ email, password }: AuthUserProps) {
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
        }, process.env.JWT_SECRET as string, { subject: user.id, expiresIn: "30d" });

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