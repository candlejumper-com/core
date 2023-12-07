import { ICalendarItem } from '@candlejumper/shared';
import { IUser } from '../../services/user/user.service';

export class CALENDAR_SET {
  static readonly type = '[Calendar] set';
  constructor(public items: ICalendarItem[]) {}
}

export class LoginSuccess {
  static readonly type = '[Calendar] login success';
  constructor(public payload: any) {}
}
