import { UserAlreadyExistsError } from "../../exceptions/UserAlreadyExistsError.js";
import prismaClient from "../../prisma/index.js"
import { hash } from "bcrypt";

interface CreateUserProps {
    name: string;
    email: string;
    password: string;
    phone?: string | null
}

class CreateUserService {
    async execute({ name, email, password, phone }: CreateUserProps) {

        const userAlreadyExists = await prismaClient.user.findFirst({
            where: {
                email: email
            }
        })

        if (userAlreadyExists) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await hash(password, 8)

        const user = await prismaClient.user.create({
            data: {
                name: name,
                email: email,
                password: passwordHash,
                phone: phone ?? null
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true
            }
        })
        return user;
    }
}

export { CreateUserService }