import { Injectable } from "@angular/core"
import { Action, Selector, State, Store } from "@ngxs/store"
import { BACKTEST_RESET, BACKTEST_SET } from "./backtest.actions"
import { IBacktestResult } from "../../services/backtest/backtest.service"

@State({
    name: 'Backtest',
    defaults: []
})
@Injectable()
export class BacktestState {

    @Selector()
    static getAll(state: IBacktestResult[]) {
        return state
    }
    
    @Action(BACKTEST_SET)
    set({setState: setState}, action: BACKTEST_SET) {
        setState(action.state)
    }

    @Action(BACKTEST_RESET)
    reset({setState: setState}) {
        setState([])
    }
}

