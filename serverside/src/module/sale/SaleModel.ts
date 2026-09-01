import mongoose from "mongoose";

const SaleItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    sku: String,
    price: {
        type: Number,
        required: true
    },
    costPrice: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    discount: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: "pcs"
    },
    total: {
        type: Number,
        required: true
    }
}, { _id: false });

const SaleSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    customer: {
        name: { type: String, default: "Walk-in Customer" },
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
        address: { type: String, default: "" }
    },
    items: [SaleItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        required: true
    },
    changeAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "card", "online", "credit", "split"],
        default: "cash"
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "partial", "due"],
        default: "paid"
    },
    orderStatus: {
        type: String,
        enum: ["completed", "cancelled", "refunded"],
        default: "completed"
    },
    notes: {
        type: String,
        default: ""
    },
    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    cashierName: {
        type: String,
        default: "Cashier"
    }
}, {
    timestamps: true,
    autoIndex: true,
    autoCreate: true
});

const SaleModel = mongoose.model("Sale", SaleSchema);
export default SaleModel;
