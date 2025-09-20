import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import config from './env';

// Configurar estrategia de Google solo si las credenciales están disponibles
if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
        passReqToCallback: true
      },
    async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Buscar usuario existente por Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Usuario ya existe, actualizar información
          user.name = profile.displayName || user.name;
          user.email = profile.emails?.[0]?.value || user.email;
          user.googleId = profile.id;
          user.isEmailVerified = true; // Google ya verificó el email
          await user.save();
          return done(null, user);
        }

        // Buscar por email si no existe por Google ID
        if (profile.emails?.[0]?.value) {
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Usuario existe pero no tiene Google ID, agregarlo
            user.googleId = profile.id;
            user.name = profile.displayName || user.name;
            user.isEmailVerified = true;
            await user.save();
            return done(null, user);
          }
        }

        // Crear nuevo usuario
        const newUser = await User.create({
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          googleId: profile.id,
          isEmailVerified: true,
          isActive: true,
          role: 'client'
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  console.log('⚠️  Google OAuth no configurado. Las variables GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET no están definidas.');
}

// Serializar usuario para la sesión
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;