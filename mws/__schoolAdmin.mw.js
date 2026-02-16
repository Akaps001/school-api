/**
 * School Admin authorization middleware
 * Requires __auth middleware to run first
 * Checks if user has school_admin role
 */
module.exports = ({ meta, config, managers }) => {
    return (args) => {
        const { req, res, next, results } = args;
        const __auth = results && results.__auth ? results.__auth : null;

        // __auth contains the decoded JWT token data
        if (!__auth || !__auth.role) {
            console.log('School admin check: No auth data found');
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                message: 'Access denied. School administrator privileges required.'
            });
        }

        if (__auth.role !== 'school_admin') {
            console.log(`School admin check failed: User role is ${__auth.role}`);
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                message: 'Access denied. School administrator privileges required.'
            });
        }

        if (!__auth.schoolId) {
            console.log('School admin check failed: No schoolId in token');
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                message: 'Access denied. School administrator must be assigned to a school.'
            });
        }

        // User is school admin with valid schoolId, pass auth data forward
        next(__auth);
    };
};
