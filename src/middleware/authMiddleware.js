export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

export const isAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        const esAdmin = req.user.rol === 'ad';
        if (esAdmin) {
            return next();
        }
    }
    res.redirect('/');
};
