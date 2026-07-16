import { Readable } from "stream";
import { CategoryNotFoundError } from "../../exceptions/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";
import cloudinary from "../../config/cloudinary.js"

interface CreateProductServiceProps{
    name: string,
    price: number,
    description: string,
    category_id: string,
    imageBuffer: Buffer,
    imageName: string
}

class CreateProductService{
    async execute({
        name,
        price, 
        description, 
        category_id, 
        imageBuffer, 
        imageName
    }: CreateProductServiceProps){

        const categoryExiste = await prismaClient.category.findFirst({
            where: {
                id: category_id
            }
        });

        if(!categoryExiste){
            throw new CategoryNotFoundError();
        }

        let bannerUrl = "";
        try {
            
            const result = await new Promise<any>((resolve, reject)=>{
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: "products",
                    resource_type: "image",
                    public_id: `${Date.now()}-${imageName.split(".")[0]}`
                }, (error, result) => {
                    if(error){
                        reject(error);
                    } else{
                        resolve(result)
                    }
                })

                const bufferStream = Readable.from(imageBuffer);
                bufferStream.pipe(uploadStream);
            })

            bannerUrl = result.secure_url

            

        } catch (error) {
            console.log(error);
            throw new Error("Erro ao fazer upload da imagem");
        }

        const product = await prismaClient.product.create({
            data: {
                name: name,
                price: price,
                description: description,
                banner: bannerUrl,
                category_id: category_id
            },
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                category_id: true,
                banner: true,
                createdAt: true
            }
        });

        return product;
    }
}

export { CreateProductService }