import {Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedUserError, UserNotFoundError } from "../exceptions/UserErrors.js";
import prismaClient from "../prisma/index.js";

export const isAdmin = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.user_id

    if(!user_id) {
        throw new UserNotFoundError();
    }

    const user = await prismaClient.user.findFirst({
        where: {
            id: user_id
        },
        select: {
            role: true
        }
    })

    if(user?.role !== "ADMIN") {
        throw new ForbiddenError();
    }

    return next();
}