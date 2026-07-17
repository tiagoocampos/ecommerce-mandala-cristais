import { Readable } from "stream";
import { CategoryNotFoundError } from "../../exceptions/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";
import cloudinary from "../../config/cloudinary.js"
import { generateSlug } from "../../utils/generateSlug.js";

interface CreateProductServiceProps{
    name: string,
    price: number,
    promo_price?: number | null | undefined,
    stock: number,          
    description: string,
    category_id: string,
    imageBuffer: Buffer,
    imageName: string,
}

class CreateProductService{
    async execute({
        name,
        price, 
        stock,
        promo_price,
        description, 
        category_id, 
        imageBuffer, 
        imageName
    }: CreateProductServiceProps){

        const slug = generateSlug(name);        
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
                stock: stock,
                slug: slug,
                promo_price: promo_price ?? null,
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
                createdAt: true,
                stock: true,
                slug: true,
                promo_price: true
            }
        });

        return product;
    }
}

export { CreateProductService }