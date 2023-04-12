import { IFaculty } from './../models/faculty.model';
import FacultyModel from '../models/faculty.model';
import axios from 'axios';
import qs from 'qs';
import log from '../utils/logger';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

interface GoogleTokenResult {
    id_token: string;
    access_token: string;
    expires_in: number;
    scope: string;
    refresh_token: string;
}
interface GoogleUserResult {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}

export const findOrCreateFaculty = async (googleId: string, email: string, name: string, avatar: string): Promise<IFaculty> => {
    const faculty = await FacultyModel.findOne({ googleId });

    if (faculty) {
        return faculty;
    }

    const newFaculty = await FacultyModel.create({ googleId, email, name, avatar });
    return newFaculty;
};

export const getGoogleOauthTokens = async ({ code }: { code: string }): Promise<GoogleTokenResult> => {
    const url = 'https://oauth2.googleapis.com/token';

    const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIERCT_URL,
        grant_type: 'authorization_code'
    };
    try {
        const res = await axios.post<GoogleTokenResult>(url, qs.stringify(values), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        return res.data;
    } catch (err: any) {
        log.error(err, 'Failed to get google oauth tokens')
        throw new Error(err.message);
    }
}

export const getGoogleUser = async ({ id_token, access_token }: { id_token: string, access_token: string }): Promise<GoogleUserResult> => {
    try {
        const res = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        });
        return res.data;
    } catch (error: any) {
        log.error(error, 'Failed to get google user');
        throw new Error(error.message);
    }

}

export const findAndUpdateFaculty = (query: FilterQuery<IFaculty>, update: UpdateQuery<IFaculty>, options: QueryOptions = {}) => {
    return FacultyModel.findOneAndUpdate(query, update, options);
}
