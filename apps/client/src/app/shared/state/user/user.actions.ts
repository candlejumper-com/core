import { IUser } from '../../services/user/user.service';

export class USER_SET {
  static readonly type = '[User] set';
  constructor(public user: IUser) {}
}

export class LoginSuccess {
  static readonly type = '[User] login success';
  constructor(public payload: any) {}
}
