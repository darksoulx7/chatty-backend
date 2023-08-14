import express, { Express } from 'express';
import { ChattyServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

class Application {
    public initialize(): void {
        this.loadConfig();
        databaseConnection();
        const app: Express = express();
        const server: ChattyServer = new ChattyServer(app);
        server.start();
    }

    public loadConfig(): void {
        config.validateConfig();
    }
}

const app: Application = new Application();
app.initialize();
