import {
    Application,
    json,
    urlencoded,
    Response,
    Request,
    NextFunction,
} from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import compression from 'compression';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';
import { config } from '@root/config';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import applicationRoutes from '@root/routes';
import Logger from 'bunyan';
import { IErrorResponse, CustomError } from '@global/helpers/error-handler';

const SERVER_PORT = 9090; // express server port
const log: Logger = config.createLogger('server');

// Wrapper around the Express app that sets up middleware, Socket.IO and the
// HTTP server.
export class ChattyServer {
    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app); // protects HTTP headers & cookies
        this.standardMiddleware(this.app); // parses body and compresses responses
        this.routeMiddleware(this.app); // add application routes
        this.globalErrorHandler(this.app); // catch-all for unhandled errors
        this.startServer(this.app); // start http and socket servers
    }

    // Configure basic security middlewares such as helmet and CORS
    private securityMiddleware(app: Application): void {
        app.use(
            cookieSession({
                name: 'session',
                keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
                maxAge: 24 * 7 * 3600000,
                secure: config.NODE_ENV !== 'development',
            }),
        );
        app.use(hpp());
        app.use(helmet());
        app.use(
            cors({
                origin: config.CLIENT_URL,
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            }),
        );
    }

    // General express middlewares not related to security
    private standardMiddleware(app: Application): void {
        app.use(compression());
        app.use(json({ limit: '50mb' }));
        app.use(urlencoded({ extended: true, limit: '50mb' }));
    }

    // Register application routes in a single place
    private routeMiddleware(app: Application): void {
        applicationRoutes(app);
    }

    // Handle 404 routes and any uncaught errors in the pipeline
    private globalErrorHandler(app: Application): void {
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                message: `${req.originalUrl} not found.`,
            });
        });

        app.use(
            (
                error: IErrorResponse,
                _req: Request,
                res: Response,
                next: NextFunction,
            ) => {
                log.error(error);
                if (error instanceof CustomError) {
                    return res
                        .status(error.statusCode)
                        .json(error.serializeErrors());
                }
                next();
            },
        );
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            const socketIO: Server = await this.createSocketIO(httpServer);
            // spin up http server and bind Socket.IO
            this.startHttpServer(httpServer);
            this.socketIOConnections(socketIO);
        } catch (error) {
            log.error(error);
        }
    }

    // Create and configure socket.io with a Redis adapter for horizontal scaling
    private async createSocketIO(httpServer: http.Server): Promise<Server> {
        const io: Server = new Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            },
        });

        const pubClient = createClient({ url: config.REDIS_HOST });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));

        return io;
    }

    // Start listening for HTTP requests
    private startHttpServer(httpServer: http.Server): void {
        log.info(`Server has started with process ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Server running on port ${SERVER_PORT}`);
        });
    }

    // Place to register Socket.IO event handlers.
    // Example:
    // io.on('connection', (socket) => {
    //     socket.on('chat message', (msg) => console.log(msg));
    // });
    private socketIOConnections(io: Server): void {}
}
