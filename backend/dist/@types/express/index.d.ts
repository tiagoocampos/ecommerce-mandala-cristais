import 'express-serve-static-core';
declare module 'express-serve-static-core' {
    interface Request {
        user_id: string;
    }
}
//# sourceMappingURL=index.d.ts.map