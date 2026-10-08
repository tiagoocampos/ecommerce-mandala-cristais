export declare class ListProductsError extends Error {
    statusCode: number;
    constructor();
}
export declare class DeleteProductError extends Error {
    statusCode: number;
    constructor();
}
export declare class ImageRequiredError extends Error {
    statusCode: number;
    constructor();
}
export declare class ProductNotFoundError extends Error {
    statusCode: number;
    constructor();
}
export declare class UpdateProductError extends Error {
    statusCode: number;
    constructor();
}
export declare class ProductAlreadyExistsError extends Error {
    statusCode: number;
    constructor();
}
export declare class ProductImageNotFoundError extends Error {
    statusCode: number;
    constructor();
}
export declare class TooManyProductImagesError extends Error {
    statusCode: number;
    constructor(max: number);
}
//# sourceMappingURL=ProductErrors.d.ts.map