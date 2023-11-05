import { Injectable } from "@angular/core"
import { Selector, State } from "@ngxs/store"
import { IBacktestResult } from "../../services/backtest/backtest.service"
import { StateService } from "../../services/state/state.service"

@State({
    name: 'ChartView',
    defaults: {
        state: new StateService()
    }
})
@Injectable()
export class ChartViewState {

    @Selector()
    static getAll(state: IBacktestResult[]) {
        return state
    }
}

