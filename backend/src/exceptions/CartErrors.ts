export class CartNotFoundError extends Error {
  public statusCode: number = 404;
  constructor() {
    super("Carrinho nao encontrado");
    this.name = "CartNotFoundError";
    Object.setPrototypeOf(this, CartNotFoundError.prototype);
  }
}

export class ItemNotFoundError extends Error {
  public statusCode: number = 404;
  constructor() {
    super("Item nao encontrado");
    this.name = "ItemNotFoundError";
    Object.setPrototypeOf(this, ItemNotFoundError.prototype);
  }
}

export class EmptyCartError extends Error {
  public statusCode: number = 400;
  constructor() {
    super("Carrinho vazio");
    this.name = "EmptyCartError";
    Object.setPrototypeOf(this, EmptyCartError.prototype);
  }
}
