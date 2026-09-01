import { z } from "zod";

export const ProductCreateDTO = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters").max(200),
    slug: z.string().optional(),
    sku: z.string().optional().nullable(),
    barcode: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    brand: z.string().optional().nullable(),
    costPrice: z.preprocess((val) => Number(val ?? 0), z.number().min(0)).optional().default(0),
    price: z.preprocess((val) => Number(val), z.number().min(0, "Price must be >= 0")),
    discount: z.preprocess((val) => Number(val ?? 0), z.number().min(0)).optional().default(0),
    stock: z.preprocess((val) => Number(val ?? 0), z.number().min(0)).optional().default(0),
    lowStockThreshold: z.preprocess((val) => Number(val ?? 5), z.number().min(0)).optional().default(5),
    unit: z.string().optional().default("pcs"),
    imageUrl: z.string().optional().nullable(),
    status: z.enum(["active", "inactive", "out_of_stock"]).optional().default("active"),
    featured: z.preprocess((val) => val === true || val === "true", z.boolean()).optional().default(false)
});

export const ProductUpdateDTO = ProductCreateDTO.partial();
