"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const faculty_controller_1 = require("./controllers/faculty.controller");
const passport_1 = __importDefault(require("passport"));
const cookie_1 = __importDefault(require("cookie"));
const internals_controller_1 = require("./controllers/internals.controller");
const upload = (0, multer_1.default)();
const accessTokenCookieOptions = {
    maxAge: 3600000,
    httpOnly: true,
    sameSite: 'none',
    path: '/',
    domain: 'mad-mini-backend.onrender.com'
};
const refreshTokenCookieOptions = Object.assign(Object.assign({}, accessTokenCookieOptions), { maxAge: 86400000 });
const routes = (app) => {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    app.post('/faculty/upload', upload.single('excelFile'), faculty_controller_1.uploadData);
    app.get('/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
    app.get('/api/sessions/oauth/google', passport_1.default.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
        try {
            const { accessToken, refreshToken } = req === null || req === void 0 ? void 0 : req.authInfo;
            const accessCookie = cookie_1.default.serialize('access_token', accessToken, Object.assign(Object.assign({}, accessTokenCookieOptions), { domain: req.hostname }));
            const resfreshCookie = cookie_1.default.serialize('refresh_token', refreshToken, Object.assign(Object.assign({}, refreshTokenCookieOptions), { domain: req.hostname }));
            res.setHeader('Set-Cookie', [accessCookie, resfreshCookie]);
            res.redirect(process.env.CLIENT_URL);
        }
        catch (err) {
            console.log(err);
        }
    });
    app.post('/faculty/logout', function (req, res, next) {
        res.clearCookie('access_token', { httpOnly: true });
        res.clearCookie('refresh_token', { httpOnly: true });
        return res.status(200).json({ message: 'Logged out successfully' });
    });
    app.post('/getInternalDetails', internals_controller_1.getInternalDetails);
    app.post('/getPreviousResults', internals_controller_1.getPreviousResults);
};
exports.default = routes;
//# sourceMappingURL=routes.js.map