import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { initializeSystemHabits } from '../utils/habitUtils.js';

if (process.env.GOOGLE_CLIENT_ID) {
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists in our database
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    await initializeSystemHabits(user._id);
                    done(null, user);
                } else {
                    // Check if user exists with the same email but registered via email/password
                    user = await User.findOne({ email: profile.emails[0].value });
                    if (user) {
                        // Link googleId to the existing account
                        user.googleId = profile.id;
                        if (!user.avatar && profile.photos && profile.photos.length > 0) {
                            user.avatar = profile.photos[0].value;
                        }
                        await user.save();
                        await initializeSystemHabits(user._id);
                        done(null, user);
                    } else {
                        // If not, create a new user
                        const newUser = {
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
                        };

                        user = await User.create(newUser);
                        await initializeSystemHabits(user._id);
                        done(null, user);
                    }
                }
            } catch (err) {
                console.error(err);
                done(err, null);
            }
        }
    )
);
}

export default passport;
