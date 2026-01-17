import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import consultaDb from '../config/consultas.js';

var router = express.Router();

router.get('/login/federated/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/productos',
    failureRedirect: '/login'
}));

router.get('/api/me', (req, res) => {
    console.log('Checking auth status. Session:', req.sessionID);
    if (req.isAuthenticated()) {
        console.log('User is authenticated:', req.user.nombre);
        res.json({
            logged: true,
            user: req.user
        });
    } else {
        console.log('User is NOT authenticated');
        res.json({ logged: false });
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/oauth2/redirect/google'
}, async function verify(accessToken, refreshToken, profile, cb) {
    console.log('Google Verify Callback reached for:', profile.displayName);
    try {
        const user = await consultaDb.LoginOrRegisterWithGoogle(profile);
        if (!user) {
            console.log('LoginOrRegisterWithGoogle returned null');
            return cb(null, false);
        }
        console.log('Login successful for:', user.nombre);
        return cb(null, user);
    } catch (err) {
        console.error("Error en autenticación Google:", err);
        return cb(err);
    }
}));

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user);
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

export default router;