const config = require('./config/index.config.js');
const Cortex = require('ion-cortex');
const ManagersLoader = require('./loaders/ManagersLoader.js');

// MongoDB connection (required)
const mongoDB = require('./connect/mongo')({
    uri: config.dotEnv.MONGO_URI
});

// Cache connection (optional - falls back to mock if Redis unavailable)
let cache;
try {
    cache = require('./cache/cache.dbh')({
        prefix: config.dotEnv.CACHE_PREFIX,
        url: config.dotEnv.CACHE_REDIS
    });
    console.log('✓ Redis cache connected');
} catch (error) {
    console.log('Redis not available - using mock cache');
    cache = require('./cache/mock-cache')();
}

// Cortex connection (optional - falls back to mock if Redis unavailable)
let cortex;
try {
    cortex = new Cortex({
        prefix: config.dotEnv.CORTEX_PREFIX,
        url: config.dotEnv.CORTEX_REDIS,
        type: config.dotEnv.CORTEX_TYPE,
        state: () => {
            return {}
        },
        activeDelay: "50ms",
        idlDelay: "200ms",
    });
    console.log('✓ Cortex connected');
} catch (error) {
    console.log('Cortex not available - using mock implementation');
    // Mock cortex
    cortex = {
        sub: () => { },
        AsyncEmitToAllOfThem: () => { },
        AsyncEmitToOneOfThem: () => { },
        AsyncEmitToOneOfThemQueue: () => { },
    };
}

const managersLoader = new ManagersLoader({ config, cache, cortex });
const managers = managersLoader.load();

managers.userServer.run();
