module.exports = {
    apps: [{
        name: 'bakers-server',
        script: './bin/www',
        env: {
            NODE_ENV: 'local'
        },
        env_production: {
            NODE_ENV: "prod",
        }
    }]
}