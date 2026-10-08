import { ZodError } from "zod";
import { UserAlreadyExistsError } from "../exceptions/UserAlreadyExistsError.js";
import { PasswordNotMatchError } from "../exceptions/passwordNotMatch.js";
import { ForbiddenError, UnauthorizedUserError, UserNotFoundError, } from "../exceptions/UserErrors.js";
import { InvalidToken } from "../exceptions/InvalidToken.js";
import { CategoryAlreadyExistsError, CategoryNotFoundError, CreateCategoryError, DeleteCategoryError, ListCategoriesError, UpdateCategoryError, } from "../exceptions/CategoryErrors.js";
import { DeleteProductError, ImageRequiredError, ListProductsError, ProductAlreadyExistsError, ProductNotFoundError, UpdateProductError, } from "../exceptions/ProductErrors.js";
import { AddItemError, CreateOrderError, InsufficientStockError, OrderNotFoundError, RemoveItemError, } from "../exceptions/OrdersErrors.js";
import { AddressNotFoundError, AddressNotOwnedError, CreateAddressError, DeleteAddressError, ListAddressError, UpdateAddressError, } from "../exceptions/AddressErrors.js";
import { CartNotFoundError, EmptyCartError, ItemNotFoundError, } from "../exceptions/CartErrors.js";
import { PaymentCreationError } from "../exceptions/PaymentErrors.js";
export const errorHandler = (error, req, res, next) => {
    if (error instanceof ZodError) {
        return res.status(400).json({
            error: "Erro de validação",
            details: error.issues.map((issue) => ({
                message: issue.message,
                path: issue.path[1],
            })),
        });
    }
    if (error instanceof UserAlreadyExistsError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof PasswordNotMatchError) {
        return res.status(error.statusCode).json({
            error: error.message,
            field: "password",
        });
    }
    if (error instanceof UserNotFoundError) {
        return res.status(error.statusCode).json({
            error: error.message,
            field: "email",
        });
    }
    if (error instanceof InvalidToken) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof CreateCategoryError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof ListCategoriesError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof CategoryNotFoundError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof ListProductsError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof DeleteProductError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof CreateOrderError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof AddItemError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof RemoveItemError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof OrderNotFoundError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof CreateAddressError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof ListAddressError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof DeleteAddressError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof AddressNotOwnedError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof AddressNotFoundError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof UnauthorizedUserError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof ForbiddenError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof CategoryAlreadyExistsError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof UpdateCategoryError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof UpdateAddressError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof DeleteCategoryError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof ImageRequiredError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof ProductNotFoundError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof UpdateProductError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof ProductAlreadyExistsError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof CartNotFoundError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof ItemNotFoundError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof EmptyCartError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof InsufficientStockError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    if (error instanceof PaymentCreationError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }
    // Qualquer outro erro de domínio com statusCode (ex.: CouponErrors) usa a própria mensagem
    const statusCode = error.statusCode;
    if (typeof statusCode === "number") {
        return res.status(statusCode).json({
            error: error.message,
        });
    }
    // Upload (multer): arquivo grande, tipo inválido, fotos demais
    if (error.name === "MulterError" || error.message?.startsWith("Invalid file type")) {
        const code = error.code;
        const message = code === "LIMIT_FILE_SIZE" ? "Cada imagem pode ter no máximo 5 MB."
            : code === "LIMIT_UNEXPECTED_FILE" || code === "LIMIT_FILE_COUNT" ? "Imagens demais ou em campo inesperado (máximo de 8 fotos adicionais)."
                : error.message?.startsWith("Invalid file type") ? "Formato de imagem inválido: use JPEG ou PNG."
                    : "Falha no envio da imagem.";
        return res.status(400).json({ error: message });
    }
    // Sem isso, erros inesperados deixavam a requisição sem resposta
    console.error(error);
    return res.status(500).json({
        error: "Erro interno do servidor",
    });
};
//# sourceMappingURL=errorHandler.js.map