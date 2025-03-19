import z from "zod";

export const userLoginSchema = z.object({
    username: z.string().min(5).max(20),
});