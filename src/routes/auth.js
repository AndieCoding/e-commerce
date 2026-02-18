import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import consultaDb from '../config/consultas.js';
import userModel from '../config/userModel.js';


var router = express.Router();

router.get('/login/federated/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/productos',
    failureRedirect: '/login'
}));

router.get('/api/me', (req, res) => {
    console.log('Checking auth status. Session:', req.sessionID);
    if (req.isAuthenticated()) {
        console.log('User is authenticated:', req.user);
        res.json({
            logged: true,
            user: req.user.toClient()
        });
    } else {
        console.log('User is NOT authenticated');
        res.json({ logged: false });
    }
});

const GOOGLE_AUTH_CONFIG = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/oauth2/redirect/google',
    proxy: true
}

passport.use(new GoogleStrategy(GOOGLE_AUTH_CONFIG, async function verify(accessToken, refreshToken, profile, cb) {
    try {
        const user = await userModel.LoginOrRegisterWithGoogle(profile);
        if (!user) {
            console.log('Error en el login o registro');
            return cb(null, false);
        }
        console.log('Login exitoso. Usuario:', user.nombre);
        return cb(null, user);
    } catch (err) {
        console.error("Error en autenticación Google:", err);
        return cb(err);
    }
}));

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.json({ success: true, message: 'Usuario deslogueado exitosamente' });
    });
});
/*
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
*/
passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

// En cada petición, busco todos los datos
passport.deserializeUser(async function (id, cb) {
    try {
        const user = await userModel.getUser(id);
        if (!user) {
            return cb(null, false);
        }
        cb(null, user);
    } catch (err) {
        cb(err);
    }
});
export default router;