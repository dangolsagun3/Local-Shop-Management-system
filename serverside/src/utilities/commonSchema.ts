import mongoose from "mongoose";

export const ImageSchema = {
    url: String,
    path: String,
    filename: String,
    size: Number,
    type: String,
};

export const ImageSchemaData = new mongoose.Schema({
    url: String,
    path: String,
    filename: String,
    size: Number,
    type: String,
}, {
    _id: false,
});

export const UserSchema = {
    type: mongoose.Types.ObjectId,
        ref: "User",
        default: null
}

export const StatusSchema = {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
}
