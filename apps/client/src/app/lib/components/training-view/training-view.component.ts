import { Component, Input, ChangeDetectorRef } from "@angular/core"
import { PlotlyModule } from "angular-plotly.js"
import { BacktestService } from "../../../shared/services/backtest/backtest.service"
import { CandleService } from "../../../shared/services/candle/candle.service"
import { TensorflowInstance } from "../../../shared/services/tensorflow/instance/tensorflow.instance"
import { ITensorflowRunResult, ITensorFlowWorkerMessageProgress } from "../../../shared/services/tensorflow/tensorflow.interfaces"
import { TensorflowService } from "../../../shared/services/tensorflow/tensorflow.service"
import { SharedModule } from "../../../shared/shared.module"
import { Graph } from "./training-view.interfaces"
import { TrainingViewService } from "./training-view.service"

PlotlyModule.plotlyjs = window['Plotly']

@Component({
  selector: 'core-training-view',
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss'],
  standalone: true,
  imports: [SharedModule, PlotlyModule],
})
export class TrainingViewComponent {
  @Input()
  instance: TensorflowInstance

  result: ITensorflowRunResult
  graph: Graph

  isBusy = true
  progress: ITensorFlowWorkerMessageProgress
  chartId: number

  constructor(
    private candleService: CandleService,
    private tensorflowService: TensorflowService,
    private backtestService: BacktestService,
    private trainingViewService: TrainingViewService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.run()
  }

  async run() {
    this.progress = {
      epoch: 0,
      totalEpoch: this.instance.options.epochs,
      loss: 0,
    }

    this.instance.result$.subscribe((result) => {
      this.result = result

      if (result) {
        this.renderChart()
      }
    })

    // TODO - unsubsribe
    // this.instance.events$.subscribe(result => {
    //   switch (result.action) {
    //     case TENSORFLOW_WORKER_ACTION.PROGRESS:
    //       this.progress = result.data as any
    //       break
    //     case TENSORFLOW_WORKER_ACTION.FINISHED:
    //       this.result = (result as ITensorFlowWorkerMessage<ITensorflowRunResult>).data

    //       // show result graph
    //       this.showResult()
    //       break
    //   }
    // })
  }

  async renderChart() {
    const candles = await this.candleService
      .loadBySymbol(this.instance.symbol, this.instance.options.timeframe, this.instance.options.count, false)
      .toPromise()

    const data = this.trainingViewService.getGraphData(
      this.result.data.inputs,
      candles,
      this.instance.options
    )

    this.graph = {
      data,
      layout: {
        height: 350,
        title: null,
        autosize: true,
        margin: {
          l: 50,
          r: 50,
          b: 50,
          t: 50,
          pad: 4,
        },
      },
    }

    this.isBusy = false

    this.changeDetectorRef.detectChanges()
  }

  cancel() {
    alert('TODO')
  }
}
