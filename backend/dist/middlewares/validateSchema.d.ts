import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
export declare const validateSchema: (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validateSchema.d.ts.map