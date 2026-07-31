export class CreateOrderError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao criar pedido");
        this.name = "CreateOrderError";
        Object.setPrototypeOf(this, CreateOrderError.prototype);
    }
}
export class AddItemError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao adicionar item ao pedido");
        this.name = "AddItemError";
        Object.setPrototypeOf(this, AddItemError.prototype);
    }
}
export class RemoveItemError extends Error {
    statusCode = 400;
    constructor() {
        super("Erro ao deletar item do pedido");
        this.name = "RemoveItemError";
        Object.setPrototypeOf(this, RemoveItemError.prototype);
    }
}
export class ItemNotFoundError extends Error {
    statusCode = 404;
    constructor() {
        super("Item não encontrado");
        this.name = "ItemNotFoundError";
        Object.setPrototypeOf(this, ItemNotFoundError.prototype);
    }
}
export class OrderNotFoundError extends Error {
    statusCode = 404;
    constructor() {
        super("Order não encontrada");
        this.name = "OrderNotFoundError";
        Object.setPrototypeOf(this, OrderNotFoundError.prototype);
    }
}
export class InsufficientStockError extends Error {
    statusCode = 400;
    constructor() {
        super("O produto não possui estoque suficiente para a quantidade solicitada.");
        this.name = "InsufficientStockError";
        Object.setPrototypeOf(this, InsufficientStockError.prototype);
    }
}
//# sourceMappingURL=OrdersErrors.js.map