// server from Node.js
import http from "http";
import app from "./app.js";

// TODO: Pass these configurations from Environment
const HOST = process.env.HOST || "127.0.0.1";
const DEFAULT_PORT = Number(process.env.PORT || 5000);

const startServer = (port: number = DEFAULT_PORT) => {
    const httpServer = http.createServer(app);

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
            console.warn(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
            return;
        }

        console.error(err);
        process.exit(1);
    });

    httpServer.listen(port, HOST, () => {
        console.log(`Server is running on http://${HOST}:${port}`);
        console.log("Press CTRL + C to disconnect the server...");
    });
};

startServer();