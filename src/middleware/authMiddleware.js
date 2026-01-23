export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

export const isAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        const userType = req.user.TIPO ? req.user.TIPO.toLowerCase() : '';
        if (userType === 'ad') {
            return next();
        }
    }
    res.redirect('/');
};
