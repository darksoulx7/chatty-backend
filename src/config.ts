import dotenv from 'dotenv';
import bunyan from 'bunyan';
import path from 'path';

// Load environment variables from '../.env' so configuration is centralized
// outside the compiled build.
dotenv.config({ path: path.resolve(`${__dirname}/../.env`) });

// Holds configuration values pulled from environment variables. By keeping them
// in one place we avoid scattering `process.env` throughout the codebase.
class Config {
    public MONGO_URL: string | undefined;
    public NODE_ENV: string | undefined;
    public JWT_TOKEN: string | undefined;
    public SECRET_KEY_ONE: string | undefined;
    public SECRET_KEY_TWO: string | undefined;
    public CLIENT_URL: string | undefined;
    public REDIS_HOST: string | undefined;

    private readonly DEFAULT_NODE_ENV = 'development';

    constructor() {
        this.MONGO_URL = process.env.MONGO_URL;
        this.JWT_TOKEN = process.env.JWT_TOKEN;
        this.NODE_ENV = process.env.NODE_ENV || this.DEFAULT_NODE_ENV;
        this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE;
        this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO;
        this.CLIENT_URL = process.env.CLIENT_URL;
        this.REDIS_HOST = process.env.REDIS_HOST;
    }

    public createLogger(name: string): bunyan {
        // Create a bunyan logger with the provided name so logs share the same format
        return bunyan.createLogger({ name, level: 'debug' });
    }

    public validateConfig(): void {
        // Ensure all required environment variables are present at startup.
        for (const [key, value] of Object.entries(this)) {
            if (value === undefined) {
                throw new Error(`Configuration ${key} is undefined`);
            }
        }
    }
}

export const config: Config = new Config();
