export class ListProductsError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao listar produtos");
        this.name = "ListProductsError";
        Object.setPrototypeOf(this, ListProductsError.prototype);
    }
}
export class DeleteProductError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao deletar produto");
        this.name = "DeleteProductError";
        Object.setPrototypeOf(this, DeleteProductError.prototype);
    }
}
export class ImageRequiredError extends Error {
    statusCode = 400;
    constructor() {
        super("Imagem obrigatória");
        this.name = "ImageRequiredError";
        Object.setPrototypeOf(this, ImageRequiredError.prototype);
    }
}
export class ProductNotFoundError extends Error {
    statusCode = 404;
    constructor() {
        super("Produto nao encontrado");
        this.name = "ProductNotFound";
        Object.setPrototypeOf(this, ProductNotFoundError.prototype);
    }
}
export class UpdateProductError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao atualizar produto");
        this.name = "UpdateProductError";
        Object.setPrototypeOf(this, UpdateProductError.prototype);
    }
}
export class ProductAlreadyExistsError extends Error {
    statusCode = 400;
    constructor() {
        super("Produto ja cadastrado");
        this.name = "ProductAlreadyExistsError";
        Object.setPrototypeOf(this, ProductAlreadyExistsError.prototype);
    }
}
export class ProductImageNotFoundError extends Error {
    statusCode = 404;
    constructor() {
        super("Imagem do produto não encontrada");
        this.name = "ProductImageNotFoundError";
        Object.setPrototypeOf(this, ProductImageNotFoundError.prototype);
    }
}
export class TooManyProductImagesError extends Error {
    statusCode = 400;
    constructor(max) {
        super(`Cada produto pode ter no máximo ${max} fotos adicionais (além da principal).`);
        this.name = "TooManyProductImagesError";
        Object.setPrototypeOf(this, TooManyProductImagesError.prototype);
    }
}
//# sourceMappingURL=ProductErrors.js.map