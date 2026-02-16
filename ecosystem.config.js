module.exports = {
    apps: [{
        name: "school-api",
        script: "./index.js",
        env: {
            NODE_ENV: "production",
            ENV: "production"
        },
        env_production: {
            NODE_ENV: "production",
            ENV: "production"
        }
    }]
}
