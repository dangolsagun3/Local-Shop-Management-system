import mongoose from "mongoose";
import { ImageSchemaData } from "../../utilities/commonSchema";

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    sku: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    barcode: {
        type: String,
        trim: true,
        sparse: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false,
        default: null
    },
    costPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 5,
        min: 0
    },
    unit: {
        type: String,
        default: "pcs",
        trim: true
    },
    image: ImageSchemaData,
    imageUrl: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["active", "inactive", "out_of_stock"],
        default: "active"
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, {
    timestamps: true,
    autoIndex: true,
    autoCreate: true
});

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
