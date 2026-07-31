import multer from "multer";
declare const _default: {
    storage: multer.StorageEngine;
    limits: {
        fileSize: number;
    };
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => void;
};
export default _default;
//# sourceMappingURL=multer.d.ts.map