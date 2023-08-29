import { Injectable } from "@angular/core"
import { Action, Selector, State, Store } from "@ngxs/store"
import { CONFIG_SET } from "./config.actions"
import { IConfigSystem } from "../../services/config/config.service"

@State({
    name: 'Config'
})
@Injectable()
export class ConfigState {

    @Selector()
    static getAll(state: IConfigSystem) {
        return state
    }

    @Action(CONFIG_SET)
    configLoaded({setState: setState}, action: CONFIG_SET) {
        setState(action.config)
    }
}

