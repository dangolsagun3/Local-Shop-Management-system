import { appConfig } from "../config/AppConfig";

export function mapImage(image: Express.Multer.File, dir: string) {
    const cleanDir = dir.startsWith('/') ? dir : '/' + dir;
    const fullDir = cleanDir.endsWith('/') ? cleanDir : cleanDir + '/';
    const basePath = (appConfig.imagePath || 'http://localhost:5000/image').replace(/\/+$/, '');
    return {
        url: `${basePath}${fullDir}${image?.filename}`,
        path: image?.path || image?.destination,
        filename: image?.filename,
        size: image?.size,
        type: image?.mimetype
    };
}

export function randomString(len=100) {
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let random = "";
    const length = chars.length;
    for (let i = 1; i <= len; i++) {
        let posn = Math.ceil(Math.random() * (length-1));
        random += chars[posn];
    }
    return random;
}