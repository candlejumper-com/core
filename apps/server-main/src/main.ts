import { System, SYSTEM_ENV } from './system/system';


// MAIN SYSTEM INSTANCE
const system = new System(SYSTEM_ENV.MAIN)

// start
system.start().then(() => {
//    process.send('ready') 
}).catch(error => {
    console.error(error)
    process.exit(1)
})

/**
 * -------------------- EXIT HANDLES -----------------------------
 */
function exitHandler(options: { cleanup: boolean, exit: boolean }, exitCode: number) {
    if (options.cleanup) {
        system.stop()
    }
    if (exitCode || exitCode === 0) {
        console.log('exit', exitCode);
    }
    if (options.exit) {
        process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
