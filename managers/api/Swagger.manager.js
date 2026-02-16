const getParamNames = require('./_common/getParamNames');

module.exports = class SwaggerManager {

    constructor({ config, managers }) {
        this.config = config;
        this.managers = managers;
    }

    generateSpec() {
        const spec = {
            openapi: '3.0.0',
            info: {
                title: 'School Management API',
                version: '1.0.0',
                description: 'Auto-generated API documentation for School Management System',
            },
            servers: [
                {
                    url: `http://localhost:${this.config.dotEnv.USER_PORT}/api`,
                    description: 'Local Development Server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
            paths: {},
        };

        Object.keys(this.managers).forEach(managerKey => {
            const manager = this.managers[managerKey];
            if (manager.httpExposed) {
                manager.httpExposed.forEach(exposed => {
                    let [method, fnName] = exposed.split('=');

                    if (!fnName) {
                        return; // Skip if no function name (e.g. middleware only or malformed)
                    }

                    method = method.trim().toLowerCase();
                    fnName = fnName.trim();

                    const path = `/${managerKey}/${fnName}`;

                    if (!spec.paths[path]) {
                        spec.paths[path] = {};
                    }

                    // Get parameters
                    let params = getParamNames(manager[fnName], fnName, managerKey);
                    params = params.split(',').map(p => p.trim().replace(/[{}]/g, '')).filter(p => p);

                    const operation = {
                        summary: `${fnName} (${managerKey})`,
                        tags: [managerKey],
                        responses: {
                            '200': {
                                description: 'Successful operation',
                            },
                        },
                    };

                    if (method === 'get' || method === 'delete') {
                        operation.parameters = params.map(p => ({
                            name: p,
                            in: 'query',
                            schema: { type: 'string' },
                        }));
                    } else {
                        operation.requestBody = {
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: params.reduce((acc, p) => {
                                            acc[p] = { type: 'string' }; // Default to string for simplicity
                                            return acc;
                                        }, {}),
                                    },
                                },
                            },
                        };
                    }

                    spec.paths[path][method] = operation;
                });
            }
        });

        return spec;
    }
}
