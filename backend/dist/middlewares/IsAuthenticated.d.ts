import { Request, Response, NextFunction } from "express";
/** Verdadeiro quando o token já passou de metade da vida. */
export declare function shouldRenew(payload: {
    iat?: number | undefined;
    exp?: number | undefined;
}, nowMs?: number): boolean;
export declare function isAuthenticated(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=IsAuthenticated.d.ts.map