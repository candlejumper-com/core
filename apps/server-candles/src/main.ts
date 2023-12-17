import { SYSTEM_ENV } from '@candlejumper/shared';
import { SystemCandles } from './system/system';

// create unique system instance
const system = new SystemCandles()

// start
system.start().catch(console.error)

