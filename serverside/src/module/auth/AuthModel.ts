import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        require: true
    },
    accessToken: String,
    refreshToken: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: "active"
    },
    agent: String,
}, {
    autoCreate: true,
    timestamps: true,
    autoIndex: true
});

const AuthModel = mongoose.model("Auth", AuthSchema)
export default AuthModel;