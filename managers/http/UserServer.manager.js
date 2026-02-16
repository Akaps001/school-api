const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { apiLimiter, authLimiter } = require('../../config/rateLimiter.config');
const app = express();

module.exports = class UserServer {
    constructor({ config, managers }) {
        this.config = config;
        this.userApi = managers.userApi;
        this.app = app;
        this._configure();
    }

    /** for injecting middlewares */
    use(args) {
        app.use(args);
    }

    _configure() {
        // Security middleware
        app.use(helmet());
        app.use(cors({ origin: this.config.dotEnv.CORS_ORIGIN }));
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        app.use('/static', express.static('public'));

        // Rate limiting for authentication endpoints
        app.use('/api/user/register', authLimiter);
        app.use('/api/user/login', authLimiter);

        // General API rate limiting
        app.use('/api/', apiLimiter);

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send('Something broke!')
        });

        // Swagger Documentation
        if (this.userApi.managers.swagger) {
            const specs = this.userApi.managers.swagger.generateSpec();
            app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
        }

        /** a single middleware to handle all */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);
    }

    /** server configs */
    run() {
        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}