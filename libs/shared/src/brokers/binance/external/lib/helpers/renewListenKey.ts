import { logger } from '@candlejumper/shared';
import extendUserDataStream from '../services/extendUserDataStream';

const renewListenKey = (apiKey) => (listenKey) => {
  setInterval(() => {
    extendUserDataStream(apiKey)(listenKey)
      .then(() => logger.info('ListenKey is renewed'));
  }, 1000 * 60 * 45); // review the key every 45 mins
};

export default renewListenKey;
