export type TokenErrorCode = "TOKEN_EXPIRED" | "TOKEN_INVALID" | "TOKEN_MISSING";
export declare class InvalidToken extends Error {
    statusCode: number;
    code: TokenErrorCode;
    constructor(code?: TokenErrorCode);
}
//# sourceMappingURL=InvalidToken.d.ts.map