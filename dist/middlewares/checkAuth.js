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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const checkAuthorization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    console.log({ authHeader });
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const decodedToken = yield jsonwebtoken_1.default.verify(token, process.env.SESSION_SECRET);
        if (!decodedToken.tokenId)
            return res.status(401).json({ error: "Unauthorized" });
        console.log({ decodedToken });
        const user = yield user_model_1.default.findOne({ _id: decodedToken.tokenId });
        if (!user || !user.valid || user.tokenType === 'EMAIL')
            return res.status(401).json({ error: "Unauthorized" });
        req.userId = user._id;
        next();
    }
    catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Unauthorized' });
    }
});
exports.default = checkAuthorization;
//# sourceMappingURL=checkAuth.js.map