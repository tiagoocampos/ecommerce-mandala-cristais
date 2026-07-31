import { z } from "zod";
export declare const updateUserRoleSchema: z.ZodObject<{
    body: z.ZodObject<{
        role: z.ZodEnum<{
            ADMIN: "ADMIN";
            STAFF: "STAFF";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateUserRoleParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=userAdminSchema.d.ts.map