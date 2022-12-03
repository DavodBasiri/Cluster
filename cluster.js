const cluster = require('cluster');
const mongoos = require("mongoose");
const os = require('os');
connectToMongoos()
if (cluster.isMaster) {
    console.log(os.cpus().length)
    for (let index = 0; index < os.cpus().length; index++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    })
}
else {
    console.log('first')
    require('./app')
}
function connectToMongoos() {
    const DB_Pancake = mongoos.createConnection('mongodb://localhost:27017/DB_Pancake', (error) => {
        if (!error)
            return console.log("\tconnected to Mongoos DB_Pancake");
        return console.log("faild to connect to Mongoos DB_Pancake")
    })
    DB_Pancake.on("connected", () => {
        console.log("\n",2,"Mongoos connected to db DB_Pancake")
    })
    DB_Pancake.on("disconnected", () => {
        console.log("Mongoos disconected to db DB_Pancake")
    })
    process.on("SIGINT", async () => {
        console.log("Mongoos SIGINT to db DB_Pancake")
        await DB_Pancake.close();
        process.exit(0);
    })

}