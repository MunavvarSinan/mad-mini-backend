import { CookieOptions } from 'express';
import { Express, Request, Response } from 'express'
import multer from 'multer';
import { uploadData } from './controllers/faculty.controller';
import passport from 'passport';
import cookie from 'cookie'
import { getInternalDetails, getPreviousResults } from './controllers/internals.controller';
const upload = multer();

interface AuthInfo {
    accessToken: string;
    refreshToken: string;
}
const accessTokenCookieOptions: CookieOptions = {
    maxAge: 3600000, // 1 hour
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    domain: 'mad-mini-backend.onrender.com'
}


const refreshTokenCookieOptions: CookieOptions = {
    ...accessTokenCookieOptions,
    maxAge: 86400000, // 1 day
};


const routes = (app: Express) => {
    app.get('/', (req: Request, res: Response) => {
        res.send('Hello World!')
    })
    app.post('/faculty/upload', upload.single('excelFile'), uploadData)
    // app.get('/api/sessions/oauth/google', googleOauthHandler);
    // app.get('/faculty/logout', facultyLogout)
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get(
        '/api/sessions/oauth/google',
        passport.authenticate('google', { failureRedirect: '/login' }),
        (req, res) => {
            try {
                // Set the access token and refresh token as cookies
                const { accessToken, refreshToken } = req?.authInfo as AuthInfo;
                const accessCookie = cookie.serialize('access_token', accessToken, {
                    ...accessTokenCookieOptions,
                    domain: req.hostname,
                });
                const resfreshCookie = cookie.serialize('refresh_token', refreshToken, {
                    ...refreshTokenCookieOptions,
                    domain: req.hostname,
                });
                res.setHeader('Set-Cookie', [accessCookie, resfreshCookie]);
                // const facultyDetails = {
                //     faculty: JSON.stringify(req.user),
                //     accessToken,
                //     refreshToken
                // }
                // Send the faculty object as a response on successful sign-in
                // res.redirect(`${process.env.CLIENT_URL}?faculty=${JSON.stringify(req.user)}?accessToken=${accessToken}?refreshToken=${refreshToken}`);
                res.redirect(process.env.CLIENT_URL as string);
            } catch (err) {
                console.log(err)
            }
        }
    );


    app.post('/faculty/logout', function (req, res, next) {
        res.clearCookie('access_token', { httpOnly: true }); // clear the access token cookie
        res.clearCookie('refresh_token', { httpOnly: true }); // clear the refresh token cookie
        return res.status(200).json({ message: 'Logged out successfully' });

    });
    app.post('/getInternalDetails', getInternalDetails);
    app.post('/getPreviousResults', getPreviousResults);
}

export default routes