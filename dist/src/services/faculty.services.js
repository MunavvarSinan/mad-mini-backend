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
exports.findAndUpdateFaculty = exports.getGoogleUser = exports.getGoogleOauthTokens = exports.findOrCreateFaculty = void 0;
const faculty_model_1 = __importDefault(require("../models/faculty.model"));
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const logger_1 = __importDefault(require("../utils/logger"));
const findOrCreateFaculty = (googleId, email, name, avatar) => __awaiter(void 0, void 0, void 0, function* () {
    const faculty = yield faculty_model_1.default.findOne({ googleId });
    if (faculty) {
        return faculty;
    }
    const newFaculty = yield faculty_model_1.default.create({ googleId, email, name, avatar });
    return newFaculty;
});
exports.findOrCreateFaculty = findOrCreateFaculty;
const getGoogleOauthTokens = ({ code }) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIERCT_URL,
        grant_type: 'authorization_code'
    };
    try {
        const res = yield axios_1.default.post(url, qs_1.default.stringify(values), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return res.data;
    }
    catch (err) {
        logger_1.default.error(err, 'Failed to get google oauth tokens');
        throw new Error(err.message);
    }
});
exports.getGoogleOauthTokens = getGoogleOauthTokens;
const getGoogleUser = ({ id_token, access_token }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        });
        return res.data;
    }
    catch (error) {
        logger_1.default.error(error, 'Failed to get google user');
        throw new Error(error.message);
    }
});
exports.getGoogleUser = getGoogleUser;
const findAndUpdateFaculty = (query, update, options = {}) => {
    return faculty_model_1.default.findOneAndUpdate(query, update, options);
};
exports.findAndUpdateFaculty = findAndUpdateFaculty;
//# sourceMappingURL=faculty.services.js.map