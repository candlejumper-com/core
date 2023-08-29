import { State } from '../../services/state/state.service';

export class BACKTEST_SET {
  static readonly type = '[Backtest] set';
  constructor(public state: State[]) {}
}

export class BACKTEST_RESET {
  static readonly type = '[Backtest] reset';
}
