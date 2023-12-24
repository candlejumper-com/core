import { ComponentModule, ModuleBase } from "@candlejumper/shared";
import { OrderService } from "./order.service";
import { OrderApi } from "./order.api";

@ComponentModule({
  service: OrderService,
  routes: [OrderApi],
  modules: [],
})
export class UserModule extends ModuleBase {

}
