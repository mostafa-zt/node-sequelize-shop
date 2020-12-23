exports.getError404 = (req, res, next) => {
    res.status(404).render('error/404', { pageTitle: 'Page Not Found!', path: '/404' });
};
exports.getError500 = (req, res, next) => {
    res.status(500).render('error/500', { pageTitle: 'ERROR!', path: '/500' });
};