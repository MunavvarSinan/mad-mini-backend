"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faculty_model_1 = __importDefault(require("./../models/faculty.model"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
passport_1.default.serializeUser((faculty, done) => {
    done(null, faculty);
});
passport_1.default.deserializeUser((faculty, done) => {
    faculty_model_1.default.findOne({ email: faculty.email }).then((faculty) => {
        if (!faculty) {
            return done(null, false);
        }
        return done(null, faculty);
    }).catch((err) => done(err));
});
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/sessions/oauth/google',
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(accessToken);
        let faculty = yield faculty_model_1.default.findOne({ email: profile.emails[0].value });
        if (!faculty) {
            faculty = yield faculty_model_1.default.create({
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar: profile.photos[0].value,
            });
        }
        done(null, faculty, { accessToken, refreshToken });
    }
    catch (err) {
        done(err);
    }
})));
exports.default = passport_1.default;
//# sourceMappingURL=passport.config.js.map