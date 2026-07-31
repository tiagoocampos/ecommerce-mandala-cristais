export class CreateCategoryError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao criar categoria");
        this.name = "CreateCategoryError";
        Object.setPrototypeOf(this, CreateCategoryError.prototype);
    }
}
export class ListCategoriesError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao listar categorias");
        this.name = "ListCategoriesError";
        Object.setPrototypeOf(this, ListCategoriesError.prototype);
    }
}
export class CategoryNotFoundError extends Error {
    statusCode = 404;
    constructor() {
        super("Categoria nao encontrada");
        this.name = "CategoryNotFoundError";
        Object.setPrototypeOf(this, CategoryNotFoundError.prototype);
    }
}
export class CategoryAlreadyExistsError extends Error {
    statusCode = 400;
    constructor() {
        super("Categoria ja cadastrada");
        this.name = "CategoryAlreadyExistsError";
        Object.setPrototypeOf(this, CategoryAlreadyExistsError.prototype);
    }
}
export class UpdateCategoryError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao atualizar categoria");
        this.name = "UpdateCategoryError";
        Object.setPrototypeOf(this, UpdateCategoryError.prototype);
    }
}
export class DeleteCategoryError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao deletar categoria");
        this.name = "DeleteCategoryError";
        Object.setPrototypeOf(this, DeleteCategoryError.prototype);
    }
}
//# sourceMappingURL=CategoryErrors.js.map