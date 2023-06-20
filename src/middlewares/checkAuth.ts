
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';

export interface CustomRequest extends Request {
    userId?: number;
}

const checkAuthorization = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    console.log({ authHeader })
    const token = authHeader?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const decodedToken = await jwt.verify(token, process.env.SESSION_SECRET as string) as { tokenId: number }
        if (!decodedToken.tokenId) return res.status(401).json({ error: "Unauthorized" });
        console.log({ decodedToken })
        const user = await UserModel.findOne({ _id: decodedToken.tokenId });
        if (!user || !user.valid || user.tokenType === 'EMAIL') return res.status(401).json({ error: "Unauthorized" });
        req.userId = user._id;
        next();
    } catch (err) {
        console.log(err)
        res.status(401).json({ message: 'Unauthorized' });
    }
}

export default checkAuthorization;