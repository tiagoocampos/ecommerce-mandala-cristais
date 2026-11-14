export declare class CreateOrderError extends Error {
    statusCode: number;
    constructor();
}
export declare class AddItemError extends Error {
    statusCode: number;
    constructor();
}
export declare class RemoveItemError extends Error {
    statusCode: number;
    constructor();
}
export declare class ItemNotFoundError extends Error {
    statusCode: number;
    constructor();
}
export declare class OrderNotFoundError extends Error {
    statusCode: number;
    constructor();
}
export declare class InvalidStatusTransitionError extends Error {
    statusCode: number;
    constructor(from: string, to: string);
}
export declare class OrderNotPayableError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare class InsufficientStockError extends Error {
    statusCode: number;
    constructor();
}
export declare class OrderNotCancelableError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=OrdersErrors.d.ts.map