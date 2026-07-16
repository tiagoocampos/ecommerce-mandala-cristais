import { z } from "zod";

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["STAFF", "ADMIN"]),
  }),
});

export const updateUserRoleParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

