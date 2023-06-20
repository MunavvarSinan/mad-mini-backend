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
exports.Authenticate = exports.Login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const EMAIL_TOKEN_EXPIRATION = 10;
const AUTHENTICATION_EXPIRATION = 24;
function generateEmailToken() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}
const JWT_SECRET = process.env.SESSION_SECRET;
function generateAuthToken(tokenId) {
    const jwtPayload = { tokenId };
    console.log({ jwtPayload });
    return jsonwebtoken_1.default.sign(jwtPayload, JWT_SECRET, {
        algorithm: 'HS256',
        noTimestamp: true,
    });
}
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const emailPattern = /^([\d]+[a-z]+[\d]+@yit\.edu\.in)$/;
    try {
        const emailToken = generateEmailToken();
        const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION * 60 * 1000);
        user_model_1.default.findOne({ email }).then((user) => {
            if (!user) {
                const newUser = new user_model_1.default({
                    email,
                    tokenType: 'EMAIL',
                    token: emailToken,
                    expiration,
                    valid: true
                });
                newUser.save().then((user) => {
                    res.status(200).json({ message: "Email sent successfully", emailToken: user.token });
                });
            }
            else {
                user.tokenType = 'EMAIL';
                user.token = emailToken;
                user.expiration = expiration;
                user.valid = true;
                user.save().then((user) => {
                    const transporter = nodemailer_1.default.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'munavvarsinan987@gmail.com',
                            pass: 'lbcibaxivctdhjbd',
                        },
                    });
                    const message = {
                        from: 'munavvarsinan987@gmail.com',
                        to: email,
                        subject: 'OTP Verification',
                        html: `<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
    }

    h1 {
      color: #333333;
    }

    h2 {
      color: #555555;
    }

    p {
      color: #555555;
    }

    .otp {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>OTP Verification</h1>
  <p>Your One-Time Password (OTP) is:</p>
  <h2 class="otp">${emailToken}</h2>
  <p>Please use this OTP to verify your account.</p>
</body>
</html>`
                    };
                    transporter.sendMail(message, (error, info) => {
                        if (error) {
                            console.error(error);
                        }
                        else {
                            console.log(info.response);
                        }
                    });
                    res.status(200).json({ message: "Email sent successfully", emailToken: user.token });
                });
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.Login = Login;
const Authenticate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token } = req.body;
    const emailPattern = /^([\d]+[a-z]+[\d]+@yit\.edu\.in)$/;
    user_model_1.default.findOne({ email: email, token: token, tokenType: 'EMAIL' }).then((user) => {
        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (user.expiration < new Date()) {
            user.valid = false;
            return res.status(401).json({ message: "Token expired" });
        }
        const expiration = new Date(new Date().getTime() + AUTHENTICATION_EXPIRATION * 60 * 60 * 1000);
        user.tokenType = 'API';
        user.token = '';
        user.expiration = expiration;
        user.save().then((user) => {
            const authToken = generateAuthToken(user._id);
            res.status(200).json({ message: "Authenticated successfully", authToken });
        });
    });
});
exports.Authenticate = Authenticate;
//# sourceMappingURL=authController.js.map