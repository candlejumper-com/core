import WebSocket from 'ws';
import { logger } from '@candlejumper/shared';

class SocketClient {

  private _ws: WebSocket
  private _handlers: Map<string, any> = new Map()

  constructor(private _path: string, public baseUrl = 'wss://stream.binance.com/') {
    this._createSocket();
  }

  _createSocket() {
    const path = this.baseUrl + this._path
    this._ws = new WebSocket(path);

    this._ws.onopen = () => {
      logger.debug('ws connected');
    };

    this._ws.on('pong', () => {
      logger.debug('receieved pong from server');
    });
    this._ws.on('ping', () => {
      logger.debug('==========receieved ping from server');
      this._ws.pong();
    });

    this._ws.onclose = () => {
      logger.warn('ws closed, restarting');
      this._createSocket()
    };

    this._ws.onerror = (err) => {
      logger.warn('ws error', err);
      throw err
    };

    this._ws.onmessage = (msg) => {
      try {
        const message = JSON.parse(msg.data as string);
        if (this.isMultiStream(message)) {
          this._handlers.get(message.stream).forEach(cb => cb(message));
        } else if (message.e && this._handlers.has(message.e)) {
          this._handlers.get(message.e).forEach(cb => {
            cb(message);
          });
        } else {
          logger.warn('Unknown method', message);
        }
      } catch (e) {
        logger.warn('Parse message failed', e);
      }
    };

    this.heartBeat();
  }

  isMultiStream(message) {
    return message.stream && this._handlers.has(message.stream);
  }

  heartBeat() {
    setInterval(() => {
      if (this._ws.readyState === WebSocket.OPEN) {
        this._ws.ping();
        logger.debug("ping server");
      }
    }, 5000);
  }

  setHandler(method, callback) {
    if (!this._handlers.has(method)) {
      this._handlers.set(method, []);
    }
    this._handlers.get(method).push(callback);
  }
}

export default SocketClient;
