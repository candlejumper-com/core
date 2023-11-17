import { SYSTEM_ENV } from '@candlejumper/shared';
import { System } from './system/system';

// MAIN SYSTEM INSTANCE
const system = new System(SYSTEM_ENV.MAIN)

// start
try {
    await system.start()
} catch (error) {
    console.error(error)
    process.exit(1)
}