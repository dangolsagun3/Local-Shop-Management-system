import mongoose from "mongoose";
import { ImageSchemaData, StatusSchema, UserSchema } from "../../utilities/commonSchema";

// export interface IBrand {
//     name: string;
//     slug: string;
//     summary: string;
//     status: {
//         type: string;
//         default: string;
//     };
//     image?: {
//         url: string;
//         publicId: string;
//     };
//     parentId?: mongoose.Types.ObjectId | null;
//     createdBy?: data,
//     updatedBy?: data
// };

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 50,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    summary: {
        type: String,
        required: true,
        min: 3,
        max: 160,
    },
    status: StatusSchema,
    image: ImageSchemaData,
    parentId: {
        type: mongoose.Types.ObjectId,
        ref: "Brand",
        default: null
    },
    createdBy: UserSchema,
    updatedBy: UserSchema
}, 
{
    autoCreate: true,
    autoIndex: true,
    timestamps: true,
},
);

const BrandModel = mongoose.model("Brand", BrandSchema);

export default BrandModel;