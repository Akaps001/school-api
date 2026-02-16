const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
module.exports = ({ meta, config, managers }) => {
    return ({ req, res, next }) => {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Authorization header missing or invalid format');
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                message: 'Authorization token required. Format: Bearer <token>'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify token using JWT_SECRET
            const decoded = jwt.verify(token, config.dotEnv.JWT_SECRET);

            if (!decoded) {
                console.log('Token verification failed');
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    message: 'Invalid or expired token'
                });
            }

            // Attach user data to request for use in subsequent middleware/handlers
            next(decoded);

        } catch (err) {
            console.log('Token verification error:', err.message);

            if (err.name === 'TokenExpiredError') {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    message: 'Token has expired'
                });
            }

            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                message: 'Invalid token'
            });
        }
    };
};
