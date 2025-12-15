const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

/**
 * Google OAuth 2.0 Strategy Configuration
 * Handles authentication for both users and captains
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Get userType from state parameter (passed during OAuth initiation)
        const userType = req.query.state || "user";
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const profilePicture = profile.photos?.[0]?.value || "";
        const firstName = profile.name?.givenName || profile.displayName?.split(" ")[0] || "";
        const lastName = profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "";

        if (!email) {
          return done(new Error("No email provided by Google"), null);
        }

        let account = null;
        const Model = userType === "captain" ? captainModel : userModel;

        // Strategy 1: Find by googleId
        account = await Model.findOne({ googleId });

        if (!account) {
          // Strategy 2: Find by email (for account linking)
          account = await Model.findOne({ email });

          if (account) {
            // Link Google OAuth to existing local account
            account.googleId = googleId;
            account.authProvider = account.authProvider === "local" ? "local" : "google";
            if (!account.profileImage && profilePicture) {
              account.profileImage = profilePicture;
            }
            // Auto-verify email for Google OAuth
            account.emailVerified = true;
            await account.save();
          } else {
            // Strategy 3: Create new account
            const newAccountData = {
              fullname: {
                firstname: firstName,
                lastname: lastName,
              },
              email,
              googleId,
              authProvider: "google",
              profileImage: profilePicture,
              emailVerified: true,
              isProfileComplete: false, // New OAuth users must complete profile
            };

            // For captains, we need additional required fields
            // They will need to complete their profile after OAuth
            if (userType === "captain") {
              newAccountData.status = "inactive";
              newAccountData.vehicle = {
                type: "car",
                color: "",
                number: "",
                capacity: 4,
              };
            }

            account = await Model.create(newAccountData);
          }
        } else {
          // Update profile picture if changed
          if (profilePicture && account.profileImage !== profilePicture) {
            account.profileImage = profilePicture;
            await account.save();
          }
        }

        return done(null, { account, userType });
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session (if using sessions)
passport.serializeUser((data, done) => {
  done(null, { id: data.account._id, userType: data.userType });
});

// Deserialize user from session
passport.deserializeUser(async (data, done) => {
  try {
    const Model = data.userType === "captain" ? captainModel : userModel;
    const account = await Model.findById(data.id);
    done(null, { account, userType: data.userType });
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
