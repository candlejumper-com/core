import { SYSTEM_ENV } from '@candlejumper/shared';
import { SystemMain } from './system/system';

// MAIN SYSTEM INSTANCE
const system = new SystemMain()

// start
try {
    await system.start()
} catch (error) {
    console.error(error)
    process.exit(1)
}