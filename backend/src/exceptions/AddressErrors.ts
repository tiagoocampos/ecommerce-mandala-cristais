export class CreateAddressError extends Error {
    public statusCode: number = 400
    constructor() {
        super("Erro ao criar endereço");
        this.name = "CreateAddressError";
        Object.setPrototypeOf(this, CreateAddressError.prototype);
    }
}

export class ListAddressError extends Error {
    public statusCode: number = 400
    constructor() {
        super("Erro ao listar endereço");
        this.name = "ListAddressError";
        Object.setPrototypeOf(this, ListAddressError.prototype);
    }
}

export class AddressNotFoundError extends Error {
    public statusCode: number = 404
    constructor() {
        super("Endereço nao encontrado");
        this.name = "AddressNotFoundError";
        Object.setPrototypeOf(this, AddressNotFoundError.prototype);
    }
}

export class DeleteAddressError extends Error {
    public statusCode: number = 400
    constructor() {
        super("Erro ao deletar endereço");
        this.name = "DeleteAddressError";
        Object.setPrototypeOf(this, DeleteAddressError.prototype);
    }
}

export class AddressNotOwnedError extends Error {
    public statusCode: number = 403
    constructor() {
        super("Este endereço não pertence ao usuário autenticado");
        this.name = "AddressNotOwnedError";
        Object.setPrototypeOf(this, AddressNotOwnedError.prototype);
    }
}

export class UpdateAddressError extends Error {
    public statusCode: number = 400
    constructor() {
        super("Erro ao atualizar endereço");
        this.name = "UpdateAddressError";
        Object.setPrototypeOf(this, UpdateAddressError.prototype);
    }
}