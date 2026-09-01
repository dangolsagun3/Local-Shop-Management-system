import mongoose from "mongoose";
import { mongoConfig } from "./AppConfig";
import { seedDatabaseIfEmpty } from "../services/SeedService";

(async () => {
    try {
        await mongoose.connect(mongoConfig.url as string, {
            dbName: mongoConfig.dbName,
            autoCreate: true,
            autoIndex: true
        });
        console.log(" ***** MongoDB Connected Successfully *****");
        // Initialize seed data if empty
        await seedDatabaseIfEmpty();
    }
    catch (exception) {
        console.log(" ***** Error while connecting to MongoDB *****");
        console.log(exception);
        process.exit(1);
    }
})();
