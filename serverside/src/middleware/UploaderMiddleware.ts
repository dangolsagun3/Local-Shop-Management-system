import multer from "multer";
import fs from "fs";
import path from "path";

const uploader = (dir = '/') => {
    const uploadDirectory = path.join("./public/uploads", dir);
    const myStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            cb(null, uploadDirectory);
        },
        filename: (req, file, cb) => {
            const name = `${Date.now()}-${file.originalname}`;
            cb(null, name);
        }
    });

    return multer({
        storage: myStorage,
        fileFilter: (req, file, cb) => {
            const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp', 'csv', 'txt', 'doc', 'docs', 'pdf'];
            const ext = file.originalname.split('.').pop() as string;

            if (allowedExts.includes(ext.toLocaleLowerCase())) {
                cb(null, true);
            } else {
                cb(new Error("File format is not supported"));
            }
        },
        limits: {
            fileSize: 3 * 1024 * 1024,
        }
    });
}
export default uploader;