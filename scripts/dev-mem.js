const { MongoMemoryServer } = require('mongodb-memory-server');
const nodemon = require('nodemon');
const path = require('path');

async function startDevServer() {
    try {
        console.log('Starting MongoDB Memory Server...');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        console.log(`InMemory Mongo URI: ${uri}`);

        // Set environment variables for the child process
        process.env.MONGO_URI = uri;
        process.env.generated_port = 5120;

        // Start nodemon with the current environment
        nodemon({
            script: 'index.js',
            ext: 'js json',
            env: {
                'MONGO_URI': uri,
                'NODE_ENV': 'development'
            },
            // Ensure we clean up on exit
            signal: 'SIGINT'
        });

        nodemon.on('start', () => {
            console.log('App has started');
        }).on('quit', async () => {
            console.log('App has quit');
            await mongod.stop();
            process.exit();
        }).on('restart', (files) => {
            console.log('App restarted due to: ', files);
        });

    } catch (error) {
        console.error('Failed to start memory server:', error);
        process.exit(1);
    }
}

startDevServer();
