export class CartNotFoundError extends Error {
    statusCode = 404;
    constructor() {
        super("Carrinho nao encontrado");
        this.name = "CartNotFoundError";
        Object.setPrototypeOf(this, CartNotFoundError.prototype);
    }
}
export class ItemNotFoundError extends Error {
    statusCode = 404;
    constructor() {
        super("Item nao encontrado");
        this.name = "ItemNotFoundError";
        Object.setPrototypeOf(this, ItemNotFoundError.prototype);
    }
}
export class EmptyCartError extends Error {
    statusCode = 400;
    constructor() {
        super("Carrinho vazio");
        this.name = "EmptyCartError";
        Object.setPrototypeOf(this, EmptyCartError.prototype);
    }
}
//# sourceMappingURL=CartErrors.js.map