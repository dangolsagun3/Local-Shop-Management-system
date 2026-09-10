import mongoose from "mongoose";
import { ImageSchemaData } from "../../utilities/commonSchema";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 2,
        max: 50,
        required: true
    },  
    email: {
        type: String,
        max: 200,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['customer', 'seller', 'cashier', 'manager', 'admin'],
        default: 'customer'
    },
    address: String,
    // address: {
    //     shipping: String,
    //     billing: String
    // },
    image: ImageSchemaData,
    phone: String,
    forgetPasswordToken: String,
    emailVerify: {
        type: Boolean,
        default: false
    },
    activationToken: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    
}, 
{
    // option
    timestamps: true, // createdAt, updatedAt
    autoIndex: true, // auto create index
    autoCreate: true // auto create collection
})

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;  