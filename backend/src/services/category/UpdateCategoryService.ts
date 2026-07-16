import { CategoryAlreadyExistsError, CategoryNotFoundError, UpdateCategoryError } from "../../exceptions/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";
import { generateSlug } from "../../utils/generateSlug.js";

interface UpdateCategoryServiceProps{
    id: string;
    name: string;
}

class UpdateCategoryService {
    async execute({id, name}: UpdateCategoryServiceProps){

        try {
            const category = await prismaClient.category.findUnique({
            where: {
                id: id,
            },
        });

        if(!category){
            throw new CategoryNotFoundError();
        }

        if(category.name === name){
            throw new CategoryAlreadyExistsError();
        }

        const slug = generateSlug(name);

        const categoryAlreadyExists = await prismaClient.category.findFirst({
            where: {
                slug: slug,
                NOT: {
                    id: id
                }
            }
        })

        if(categoryAlreadyExists){
            throw new CategoryAlreadyExistsError();
        }

        const categoryUpdate = await prismaClient.category.update({
            where: {
                id: id,
            },
            data: {
                name: name,
                slug: slug
            }
        });
        return categoryUpdate;
        } catch (error) {
            console.log(error)
            if(error instanceof CategoryNotFoundError){
                throw error;
            }
            if(error instanceof CategoryAlreadyExistsError){
                throw error;
            }

            throw new UpdateCategoryError();
        }
    }
}

export { UpdateCategoryService };