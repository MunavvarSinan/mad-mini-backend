import mongoose from 'mongoose';
import logger from './logger';


const connect = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI as string);
        logger.info('Connected to MongoDB');
    } catch (err) {
        logger.error("Could not connect to MongoDB");
        process.exit(1);
    }


}
export default connect;