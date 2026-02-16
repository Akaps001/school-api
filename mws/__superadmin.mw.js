/**
 * Superadmin authorization middleware
 * Requires __auth middleware to run first
 * Checks if user has superadmin role
 */
module.exports = ({ meta, config, managers }) => {
    return (args) => {
        const { req, res, next, results } = args;
        const __auth = results && results.__auth ? results.__auth : null;

        // __auth contains the decoded JWT token data
        if (!__auth || !__auth.role) {
            console.log('Superadmin check: No auth data found');
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                message: 'Access denied. Superadmin privileges required.'
            });
        }

        if (__auth.role !== 'superadmin') {
            console.log(`Superadmin check failed: User role is ${__auth.role}`);
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                message: 'Access denied. Superadmin privileges required.'
            });
        }

        // User is superadmin, pass auth data forward
        next(args);
    };
};
