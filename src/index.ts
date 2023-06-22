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
const port = process.env.PORT
const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));
app.get('*.map', (req, res, next) => {
    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow the HTTP methods you need
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Allow the headers you need
    next();
});

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
// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     next();
// });
// app.use(passport.initialize());
app.use(passport.session());

app.listen(port, async () => {
    logger.info(`Server is running on port ${port}`);
    await connect();
    routes(app);
})

export default app;