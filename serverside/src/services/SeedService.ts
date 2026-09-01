import CategoryModel from "../module/category/CategoryModel";
import BrandModel from "../module/brand/BrandModel";
import ProductModel from "../module/product/ProductModel";
import UserModel from "../module/user/UserModel";
import bcrypt from "bcryptjs";
import slugify from "slugify";

export async function seedDatabaseIfEmpty() {
    try {
        const productCount = await ProductModel.countDocuments();
        if (productCount > 0) {
            console.log("Database already contains products. Skipping initial seed.");
            return;
        }

        console.log("Seeding initial store data for ShopX...");

        // Ensure default admin user
        let adminUser = await UserModel.findOne({ role: "admin" });
        if (!adminUser) {
            adminUser = new UserModel({
                name: "ShopX Admin",
                email: "admin@shopx.com",
                password: bcrypt.hashSync("admin123", 12),
                role: "admin",
                status: "active",
                emailVerify: true,
                phone: "+977 9800000000",
                address: "Kathmandu, Nepal"
            });
            await adminUser.save();
            console.log("Created default Admin: admin@shopx.com / admin123");
        }

        // Seed Categories
        const categoriesData = [
            { name: "Beverages & Drinks", summary: "Cold drinks, juices, coffee and tea", status: "active" },
            { name: "Snacks & Munchies", summary: "Chips, cookies, biscuits and quick bites", status: "active" },
            { name: "Dairy, Bread & Eggs", summary: "Fresh milk, cheese, butter, curd and bread", status: "active" },
            { name: "Groceries & Staples", summary: "Rice, flour, cooking oil, pulses and spices", status: "active" },
            { name: "Personal Care & Hygiene", summary: "Soaps, shampoos, toothpaste and skin care", status: "active" },
            { name: "Household & Cleaning", summary: "Detergents, dishwashers and floor cleaners", status: "active" },
            { name: "Confectionery & Sweets", summary: "Chocolates, candies, gums and sweets", status: "active" }
        ];

        const categoryMap = new Map();
        for (const cat of categoriesData) {
            const slug = slugify(cat.name, { lower: true, strict: true });
            let existing = await CategoryModel.findOne({ slug });
            if (!existing) {
                existing = new CategoryModel({
                    ...cat,
                    slug,
                    createdBy: adminUser._id
                });
                await existing.save();
            }
            categoryMap.set(cat.name, existing._id);
        }

        // Seed Brands
        const brandsData = [
            { name: "Coca-Cola", summary: "Global beverage corporation", status: "active" },
            { name: "Nestlé", summary: "Food and drink processing", status: "active" },
            { name: "Unilever", summary: "Consumer goods company", status: "active" },
            { name: "PepsiCo", summary: "Beverages and snack food", status: "active" },
            { name: "Amul", summary: "Dairy cooperative", status: "active" },
            { name: "Britannia", summary: "Bakery and dairy foods", status: "active" },
            { name: "P&G", summary: "Procter & Gamble personal health and hygiene", status: "active" },
            { name: "Local Harvest", summary: "Farm fresh organic produce", status: "active" }
        ];

        const brandMap = new Map();
        for (const b of brandsData) {
            const slug = slugify(b.name, { lower: true, strict: true });
            let existing = await BrandModel.findOne({ slug });
            if (!existing) {
                existing = new BrandModel({
                    ...b,
                    slug,
                    createdBy: adminUser._id
                });
                await existing.save();
            }
            brandMap.set(b.name, existing._id);
        }

        // Seed Products
        const productsData = [
            {
                name: "Coca-Cola Original Taste 500ml",
                category: categoryMap.get("Beverages & Drinks"),
                brand: brandMap.get("Coca-Cola"),
                costPrice: 50,
                price: 65,
                discount: 0,
                stock: 45,
                lowStockThreshold: 10,
                unit: "bottle",
                sku: "BEV-COKE-500",
                barcode: "890103001001",
                imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60",
                description: "Refreshing carbonated soft drink with original classic cola taste.",
                featured: true
            },
            {
                name: "Lay's Classic Salted Potato Chips 50g",
                category: categoryMap.get("Snacks & Munchies"),
                brand: brandMap.get("PepsiCo"),
                costPrice: 28,
                price: 40,
                discount: 0,
                stock: 60,
                lowStockThreshold: 15,
                unit: "pack",
                sku: "SNK-LAYS-CLS",
                barcode: "890103001002",
                imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60",
                description: "Crispy and golden thinly sliced potato chips seasoned with fine salt.",
                featured: true
            },
            {
                name: "Amul Pure Butter 500g",
                category: categoryMap.get("Dairy, Bread & Eggs"),
                brand: brandMap.get("Amul"),
                costPrice: 240,
                price: 290,
                discount: 10,
                stock: 18,
                lowStockThreshold: 5,
                unit: "pack",
                sku: "DRY-AMUL-BTR",
                barcode: "890103001003",
                imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60",
                description: "Pasteurized salted butter made from wholesome fresh cream.",
                featured: true
            },
            {
                name: "Nescafé Classic Instant Coffee Jar 100g",
                category: categoryMap.get("Beverages & Drinks"),
                brand: brandMap.get("Nestlé"),
                costPrice: 320,
                price: 390,
                discount: 15,
                stock: 12,
                lowStockThreshold: 4,
                unit: "jar",
                sku: "BEV-NES-100G",
                barcode: "890103001004",
                imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60",
                description: "100% pure roasted coffee granules with a rich aroma and bold flavor.",
                featured: true
            },
            {
                name: "Basmati Premium Long Grain Rice 5kg",
                category: categoryMap.get("Groceries & Staples"),
                brand: brandMap.get("Local Harvest"),
                costPrice: 650,
                price: 780,
                discount: 30,
                stock: 25,
                lowStockThreshold: 5,
                unit: "bag",
                sku: "GRO-RICE-5KG",
                barcode: "890103001005",
                imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
                description: "Aromatic extra long grain basmati rice, aged for exquisite flavor and fluffy texture.",
                featured: true
            },
            {
                name: "Britannia Good Day Butter Cookies 200g",
                category: categoryMap.get("Snacks & Munchies"),
                brand: brandMap.get("Britannia"),
                costPrice: 35,
                price: 50,
                discount: 0,
                stock: 35,
                lowStockThreshold: 8,
                unit: "pack",
                sku: "SNK-GD-200G",
                barcode: "890103001006",
                imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=60",
                description: "Crunchy butter cookies packed with rich taste in every bite.",
                featured: false
            },
            {
                name: "Dove Deep Moisture Body Wash 250ml",
                category: categoryMap.get("Personal Care & Hygiene"),
                brand: brandMap.get("Unilever"),
                costPrice: 220,
                price: 280,
                discount: 0,
                stock: 14,
                lowStockThreshold: 4,
                unit: "bottle",
                sku: "PER-DOVE-250",
                barcode: "890103001007",
                imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60",
                description: "Nourishing body wash for softer, smoother skin after just one shower.",
                featured: false
            },
            {
                name: "Sunlight Dishwashing Liquid Lemon 500ml",
                category: categoryMap.get("Household & Cleaning"),
                brand: brandMap.get("Unilever"),
                costPrice: 110,
                price: 150,
                discount: 10,
                stock: 22,
                lowStockThreshold: 5,
                unit: "bottle",
                sku: "HOU-SUN-500",
                barcode: "890103001008",
                imageUrl: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=500&auto=format&fit=crop&q=60",
                description: "Cuts through tough grease quickly with real lemon juice essence.",
                featured: false
            },
            {
                name: "KitKat 4-Finger Milk Chocolate 41.5g",
                category: categoryMap.get("Confectionery & Sweets"),
                brand: brandMap.get("Nestlé"),
                costPrice: 40,
                price: 60,
                discount: 0,
                stock: 3,
                lowStockThreshold: 5,
                unit: "bar",
                sku: "SWT-KITKAT-4F",
                barcode: "890103001009",
                imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60",
                description: "Crispy wafer fingers covered in smooth milk chocolate. Have a break, have a KitKat!",
                featured: true
            },
            {
                name: "Fresh Whole Milk 1 Litre",
                category: categoryMap.get("Dairy, Bread & Eggs"),
                brand: brandMap.get("Local Harvest"),
                costPrice: 75,
                price: 95,
                discount: 0,
                stock: 2,
                lowStockThreshold: 5,
                unit: "litre",
                sku: "DRY-MILK-1L",
                barcode: "890103001010",
                imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
                description: "Fresh, pasteurized full cream milk delivered daily from local farms.",
                featured: false
            }
        ];

        for (const prod of productsData) {
            const slug = slugify(prod.name, { lower: true, strict: true });
            const product = new ProductModel({
                ...prod,
                slug,
                status: prod.stock <= 0 ? "out_of_stock" : "active",
                createdBy: adminUser._id,
                updatedBy: adminUser._id
            });
            await product.save();
        }

        console.log(`Successfully seeded ${productsData.length} products with categories & brands!`);
    } catch (err) {
        console.error("Error seeding initial data:", err);
    }
}
