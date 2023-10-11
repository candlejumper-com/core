module.exports = {
    apps: [
        {
            name: "client",
            script: "npm",
            args: "run client:dev"
        },
        {
            name: "server-main",
            script: "npm",
            args: "run server-main:dev"
        },
        {
            name: "candles",
            script: "npm",
            args: "run server-candles:dev"
        }
    ]
}