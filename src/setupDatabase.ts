import mongoose from 'mongoose';
import { config } from '@root/config';
import bunyan from 'bunyan';

// Handles MongoDB connection using mongoose. The function reconnects when the
// connection is lost.

const log: bunyan = config.createLogger('db');
export default () => {
    const connect = () => {
        // Mongoose handles connection pooling internally. If the initial
        // attempt fails the process exits because the app cannot work
        // without a database connection.
        mongoose
            .connect(`${config.MONGO_URL}`)
            .then(() => {
                log.info('Successfully connected to database');
            })
            .catch((err) => {
                log.error(`Error connecting to database ${err}`);
                return process.exit(1);
            });
    };
    connect();

    // Automatically try to reconnect whenever the connection drops.
    mongoose.connection.on('disconnected', connect);
};
