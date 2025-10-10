const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const dotenv = require("dotenv");
const User = require("../model/user.model");

dotenv.config();

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });
                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        profilePic: profile.photos[0].value,
                        provider: "google",
                        isVerified: profile.emails[0].verified,
                    });
                }
                return done(null, user);
            } catch (error) {
                 return done(error, null);
            }
        }
    )
);

module.exports = passport
