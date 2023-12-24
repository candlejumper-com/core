import { ComponentModule, ModuleBase } from "@candlejumper/shared";
import { UserApi } from "./user.api";
import { UserService } from "./user.service";
import { ApiServer } from "../../system/system.api";

@ComponentModule({
  service: UserService,
  routes: [UserApi],
  modules: [],
})
export class UserModule extends ModuleBase {

}
