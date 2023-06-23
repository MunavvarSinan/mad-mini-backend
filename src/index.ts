import 'dotenv/config';
import express from 'express';
import connect from './utils/connect';
import logger from './utils/logger';
import routes from './routes';
import session from 'express-session';
import passport from './config/passport.config';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT;
const corsOptions = {
    origin: 'http://192.168.71.121:19000/',
    credentials: true,
};
app.use(cors(corsOptions)); // Enable CORS for all routes

app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Add your routes here
routes(app);

app.listen(port, async () => {
    logger.info(`Server is running on port ${port}`);
    await connect();
});

export default app;
