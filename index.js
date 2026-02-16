const config = require('./config/index.config.js');
const Cortex = require('ion-cortex');
const ManagersLoader = require('./loaders/ManagersLoader.js');
const Aeon = require('aeon-machine');

// Don't exit on Redis connection errors
process.on('uncaughtException', err => {
    // Allow Redis connection errors during startup
    if (err.code === 'ECONNREFUSED' || (err.message && err.message.includes('ECONNREFUSED'))) {
        console.log('Redis connection error (continuing without Redis):', err.message);
        return;
    }
    console.log(`Uncaught Exception:`)
    console.log(err, err.stack);
    process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
    // Allow Redis connection rejections
    if (reason && (reason.code === 'ECONNREFUSED' || (reason.message && reason.message.includes('ECONNREFUSED')))) {
        console.log('Redis connection rejected (continuing without Redis):', reason.message);
        return;
    }
    console.log('Unhandled rejection at ', promise, `reason:`, reason);
    process.exit(1)
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Exiting...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Exiting...');
    process.exit(0);
});

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
} catch (error) {
    console.log('Redis cache not available  using mock cache');
    cache = require('./cache/mock-cache')();
}

// Oyster connection (optional - falls back to mock if Redis unavailable)
let oyster;
try {
    const Oyster = require('oyster-db');
    oyster = new Oyster({
        url: config.dotEnv.OYSTER_REDIS,
        prefix: config.dotEnv.OYSTER_PREFIX
    });
} catch (error) {
    console.log('⚠️  Oyster not available - using mock implementation');
    oyster = {
        get: async () => null,
        set: async () => true,
        delete: async () => true
    };
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
        activeDelay: "50",
        idlDelay: "200",
    });
} catch (error) {
    console.log('Cortex not available using mock implementation');
    cortex = {
        sub: () => { },
        AsyncEmitToAllOfThem: () => { },
        AsyncEmitToOneOfThem: () => { },
        AsyncEmitToOneOfThemQueue: () => { },
    };
}

// Aeon (optional - depends on cortex)
let aeon;
try {
    aeon = new Aeon({ cortex, timestampFrom: Date.now(), segmantDuration: 500 });
} catch (error) {
    console.log(' Aeon not available - using mock implementation');
    aeon = {
        on: () => { },
        emit: () => { },
        removeListener: () => { }
    };
}

const managersLoader = new ManagersLoader({ config, cache, cortex, oyster, aeon });
const managers = managersLoader.load();

if (require.main === module) {
    managers.userServer.run();
}

module.exports = managers.userServer.app;
