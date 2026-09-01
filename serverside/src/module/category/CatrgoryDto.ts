import z from "zod";

export const CategoryCreateDTO = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long").max(50, "Name Must be at most 50 characters"),
    summary: z.string().min(10, "Summary must be at least 10 characters long").max(200, "Summary Must be at most 200 characters"),
    status: z.string().regex(/^(active|inactive)$/, "Status must be either 'active' or 'inactive'").nonempty("Status is required").default("inactive"),
    description: z.string().optional(),
    parentId: z.number().optional(),
})