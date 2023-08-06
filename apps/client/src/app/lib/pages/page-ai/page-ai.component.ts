import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AIService } from '../../../shared/services/ai/ai.service';
import { CandleService } from '../../../shared/services/candle/candle.service';
import { TENSORFLOW_HARDWARE } from '../../../shared/services/tensorflow/tensorflow.util';
import { SharedModule } from '../../../shared/shared.module';
import { TrainingViewComponent } from '../../components/training-view/training-view.component';
import { CANDLE_DATA_ORIGIN } from '@candlejumper/shared';

@Component({
  selector: 'core-page-ai',
  templateUrl: './page-ai.component.html',
  styleUrls: ['./page-ai.component.scss'],
  standalone: true,
  imports: [SharedModule, TrainingViewComponent],
})
export class PageAIComponent {
  activeContainerTab = 0
  activeTab = 0

  form = new FormGroup({
    symbols: new FormControl(['OIL', 'AAPL'], [Validators.required]),
    timeframe: new FormControl('1d', [Validators.required]),
    SMALength: new FormControl<number>(50, [Validators.required]),
    RSILength: new FormControl<number>(50, [Validators.required]),
    BBLength: new FormControl<number>(50, [Validators.required]),
    predictionSize: new FormControl<number>(200, [Validators.required]),
    epochs: new FormControl<number>(1, [Validators.required]),
    learningRate: new FormControl<number>(0.01, [Validators.required]),
    hiddenLayers: new FormControl<number>(4, [Validators.required]),
    hardware: new FormControl<TENSORFLOW_HARDWARE>(TENSORFLOW_HARDWARE.WASM, [Validators.required]),
    dataOrigin: new FormControl<CANDLE_DATA_ORIGIN>(CANDLE_DATA_ORIGIN.STATIC, [Validators.required]),
    model: new FormControl('custom1', [Validators.required]),
    count: new FormControl(3000, [Validators.required]),
  });

  constructor(public aiService: AIService, public candleService: CandleService) {}

  run() {
    this.aiService.run(this.form.value)

    this.activeTab = this.aiService.containers$.value.length - 1
  }
}
