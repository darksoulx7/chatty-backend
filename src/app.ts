import express, { Express } from 'express';
import { ChattyServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';
import { config } from '@root/config';

// Entry point that wires up server and database. All heavy lifting is done by
// the setup classes to keep initialization readable.

class Application {
    public initialize(): void {
        this.loadConfig(); // ensure environment variables are present
        databaseConnection(); // connect to MongoDB
        const app: Express = express();
        // the server class sets up middleware, routes and Socket.IO
        const server: ChattyServer = new ChattyServer(app);
        server.start(); // kick everything off
    }

    public loadConfig(): void {
        config.validateConfig();
    }
}

const app: Application = new Application();
app.initialize();
