import z from "zod";

export const UserName = z.string().min(2, "Name must have at least 2 characters").max(50, "Name cannot exceed 50 characters");
export const UserEmail = z.string().email("Invalid email address").min(3, "Email is compulsory");

export const UserRegisterDTO = z.object({
    name: z.string().min(2, "Name must have at least 2 characters").max(50, "Name cannot exceed 50 characters").optional(),
    fullName: z.string().min(2, "Name must have at least 2 characters").max(50, "Name cannot exceed 50 characters").optional(),
    email: UserEmail,
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    contact: z.string().optional().nullable(),
    role: z.enum(['customer', 'seller', 'cashier', 'manager', 'admin']).optional().default("customer"),
    address: z.string().nullable().optional()
}).refine((val) => {
    return !!(val.name || val.fullName);
}, {
    message: "Name or fullName is required",
    path: ['name']
}).refine((val) => {
    if (val.confirmPassword === undefined || val.confirmPassword === null || val.confirmPassword === '') {
        return true;
    }
    return val.password === val.confirmPassword;
}, {
    message: "Password and Confirm Password must be same",
    path: ['confirmPassword']
});

export const LoginDTO = z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    contact: z.string().optional(),
    password: z.string().min(1, "Password is required")
}).refine((val) => {
    return !!(val.username || val.email || val.contact);
}, {
    message: "Email, Username or Contact is required",
    path: ['username']
});