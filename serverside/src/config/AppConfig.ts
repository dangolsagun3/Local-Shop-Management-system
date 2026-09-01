import { config } from "dotenv";
config();

export const appConfig = {
    imagePath: process.env.IMAGE_BASE_PATH,
    jwtSecret: process.env.JWT_SECRET || 'localshop-secret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'localshop-refresh-secret',
};

export const mongoConfig = {
    url: process.env.MONGODB_URL,
    dbName: process.env.DB_NAME || 'api-63',
};

export const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    formAddress: process.env.SMTP_FROM_ADDRESS,
    service: process.env.SMTP_SERVICE,
};