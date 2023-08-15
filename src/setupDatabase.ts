import mongoose from 'mongoose';
import { config } from '@root/config';
import bunyan from 'bunyan';

const log: bunyan = config.createLogger('db');
export default () => {
    const connect = () => {
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

    mongoose.connection.on('disconnect', connect);
};
