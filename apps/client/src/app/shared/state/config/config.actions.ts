import { IConfigResponse, IConfigSystem } from '../../services/config/config.service';

export class CONFIG_SET {
  static readonly type = '[Config] set';
  constructor(public config: IConfigResponse) {}
}
