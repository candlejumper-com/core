import 'reflect-metadata'
import { System } from './system/system';

process.stdin.resume()

// create unique system instance
const system = new System()

// start
system.start().catch(console.error)

function exitHandler(options: { cleanup: boolean, exit: boolean }, exitCode: number) {
    if (options.cleanup) {
        system.stop()
    }
    if (exitCode || exitCode === 0) {
        console.trace()
        console.log('EXIT CODE: ' + exitCode);
    }
    if (options.exit) {
        process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

