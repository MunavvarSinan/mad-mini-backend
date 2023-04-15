import FacultyModel, { IFaculty } from './../models/faculty.model';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';

passport.serializeUser((faculty, done) => {
    done(null, faculty);
});

passport.deserializeUser((faculty: IFaculty, done) => {
    // Find the user in the database based on the faculty object provided by passport
    FacultyModel.findOne({ email: faculty.email }).then((faculty) => {

        if (!faculty) {
            return done(null, false);
        }
        // If the user is found, return it to passport
        return done(null, faculty);
    }).catch((err) => done(err));
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: 'https://mad-mini-backend.onrender.com/api/sessions/oauth/google',
        },
        async (accessToken, refreshToken, profile: Profile, done) => {
            try {
                console.log(accessToken)
                let faculty = await FacultyModel.findOne({ email: profile.emails![0].value });

                if (!faculty) {
                    // Create new faculty member account
                    faculty = await FacultyModel.create({
                        email: profile.emails![0].value,
                        name: profile.displayName,
                        avatar: profile.photos![0].value,
                        // Add any additional faculty member data from the profile here
                    });
                }

                // Return the faculty object to the done callback
                done(null, faculty, { accessToken, refreshToken });
            } catch (err) {
                done(err as Error);
            }
        }
    )
);
export default passport