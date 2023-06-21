
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import UserModel from "../models/user.model";
import nodemailer from 'nodemailer';
import FacultyModel from "../models/faculty.model";

const EMAIL_TOKEN_EXPIRATION = 10
const AUTHENTICATION_EXPIRATION = 24


function generateEmailToken() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

const JWT_SECRET = process.env.SESSION_SECRET as string;

function generateAuthToken(tokenId: number): string {
    const jwtPayload = { tokenId };
    console.log({ jwtPayload })
    return jwt.sign(jwtPayload, JWT_SECRET, {
        algorithm: 'HS256',
        noTimestamp: true,
    });

}
export const Login = async (req: Request, res: Response) => {
    const { email } = req.body;
    const studentEmailRegex = /^([\d]+yit+[\d]+@yit\.edu\.in)$/;
    const facultyEmailRegex = /^([a-z0-9]+@gmail\.com)$/;
    // const facultyEmailRegex = /^([a-z0-9]+@yit\.edu\.in)$/;

    if (studentEmailRegex.test(email)) {
        try {
            const emailToken = generateEmailToken();
            const expiration = new Date(
                new Date().getTime() + EMAIL_TOKEN_EXPIRATION * 60 * 1000
            );
            UserModel.findOne({ email }).then((user) => {
                if (!user) {
                    const newUser = new UserModel({
                        email,
                        tokenType: 'EMAIL',
                        token: emailToken,
                        expiration,
                        valid: true,
                    });
                    newUser.save().then((user) => {
                        res
                            .status(200)
                            .json({
                                message: 'Email sent successfully',
                                emailToken: user.token,
                                user: 'STUDENT',
                            });
                    });
                } else {
                    user.tokenType = 'EMAIL';
                    user.token = emailToken;
                    user.expiration = expiration;
                    user.valid = true;
                    user.save().then((user) => {
                        const transporter = nodemailer.createTransport({
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
                            html: `<html>...</html>`,
                        };
                        transporter.sendMail(message, (error, info) => {
                            if (error) {
                                console.error(error);
                            } else {
                                console.log(info.response);
                            }
                        });
                        res
                            .status(200)
                            .json({
                                message: 'Email sent successfully',
                                emailToken: user.token,
                                user: 'STUDENT',
                            });
                    });
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Something went wrong' });
        }
        return; // Add a return statement here
    }

    if (facultyEmailRegex.test(email)) {
        try {
            const emailToken = generateEmailToken();
            const expiration = new Date(
                new Date().getTime() + EMAIL_TOKEN_EXPIRATION * 60 * 1000
            );
            FacultyModel.findOne({ email }).then((user) => {
                if (!user) {
                    const newUser = new FacultyModel({
                        email,
                        tokenType: 'EMAIL',
                        token: emailToken,
                        expiration,
                        valid: true,
                    });
                    newUser.save().then((user) => {
                        res
                            .status(200)
                            .json({
                                message: 'Email sent successfully',
                                emailToken: user.token,
                                user: 'FACULTY',
                            });
                    });
                } else {
                    user.tokenType = 'EMAIL';
                    user.token = emailToken;
                    user.expiration = expiration;
                    user.valid = true;
                    user.save().then((user) => {
                        const transporter = nodemailer.createTransport({
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
                            html: `<html>...</html>`,
                        };
                        transporter.sendMail(message, (error, info) => {
                            if (error) {
                                console.error(error);
                            } else {
                                console.log(info.response);
                            }
                        });
                        res
                            .status(200)
                            .json({
                                message: 'Email sent successfully',
                                emailToken: user.token,
                                user: 'FACULTY',
                            });
                    });
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Something went wrong' });
        }
        return; // Add a return statement here
    }

    // Handle the case when the email doesn't match any condition
    res.status(400).json({ message: 'Enter a valid email address' });
};


export const Authenticate = async (req: Request, res: Response) => {
    const { email, token } = req.body;
    const studentEmailRegex = /^([\d]+[a-z]+[\d]+@yit\.edu\.in)$/;
    const facultyEmailRegex = /^([a-z0-9]+@gmail\.com)$/;
    // const facultyEmailRegex = /^([a-z0-9]+@yit\.edu\.in)$/;


    if (studentEmailRegex.test(email)) {
        UserModel.findOne({ email: email, token: token, tokenType: 'EMAIL' }).then((user) => {
            if (!user) {
                return res.status(401).json({ message: "Invalid token" })
            }
            if (user.expiration < new Date()) {
                user.valid = false;
                return res.status(401).json({ message: "Token expired" })
            }
            const expiration = new Date(new Date().getTime() + AUTHENTICATION_EXPIRATION * 60 * 60 * 1000);
            user.tokenType = 'API';
            user.token = '';
            user.expiration = expiration;
            user.save().then((user) => {
                const authToken = generateAuthToken(user._id);
                res.status(200).json({ message: "Authenticated successfully", authToken, user: 'STUDENT' })
            }
            )
        });
    }
    else if (facultyEmailRegex.test(email)) {
        FacultyModel.findOne({ email: email, token: token, tokenType: 'EMAIL' }).then((user) => {
            if (!user) {
                return res.status(401).json({ message: "Invalid token" })
            }
            if (user.expiration < new Date()) {
                user.valid = false;
                return res.status(401).json({ message: "Token expired" })
            }
            const expiration = new Date(new Date().getTime() + AUTHENTICATION_EXPIRATION * 60 * 60 * 1000);
            user.tokenType = 'API';
            user.token = '';
            user.expiration = expiration;
            user.save().then((user) => {
                const authToken = generateAuthToken(user._id);
                res.status(200).json({ message: "Authenticated successfully", authToken, user: 'FACULTY' })
            }
            )
        });
    }
}

export const facultyLogin = async (req: Request, res: Response) => {

}