import { Application } from 'express';
import { System } from '../../system/system';
import * as fs from 'fs';
import * as path from 'path';
import { Socket } from 'socket.io';

const PATH_SNAPSHOT_BACKTEST = path.join(
  __dirname,
  '../../../../../_data/snapshots/backtest'
);

export default function (system: System, app: Application, socket?: Socket) {
  if (app) {
    app.get('/api/snapshot/:symbol/:interval/:time', async (req, res) => {
      const symbol = req.params.symbol;
      const orderTime = req.params.time;
      const interval = req.params.interval;
      const snapshot = fs.readFileSync(
        `${PATH_SNAPSHOT_BACKTEST}/${symbol}-${interval}-${orderTime}.json`,
        'utf-8'
      );
      res.send(snapshot);
    });
  }

  if (socket) {
    socket.on('delete:/api/snapshots', (callback) => {
      fs.readdir(PATH_SNAPSHOT_BACKTEST, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          fs.unlink(path.join(PATH_SNAPSHOT_BACKTEST, file), (err) => {
            if (err) throw err;
          });
        }
      });
      callback();
    });
  }
}
