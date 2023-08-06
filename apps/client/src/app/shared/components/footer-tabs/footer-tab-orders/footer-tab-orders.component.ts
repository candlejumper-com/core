import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CandleService } from '../../../services/candle/candle.service';
import { ChartService } from '../../../services/chart/chart.service';
import { ConfigService } from '../../../services/config/config.service';
import { OrderService, IOrder } from '../../../services/order/order.service';
import { SharedModule } from '../../../shared.module';


@Component({
  selector: 'app-footer-tab-orders',
  templateUrl: './footer-tab-orders.component.html',
  styleUrls: ['./footer-tab-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule]
})
export class FooterTabOrdersComponent implements OnInit {

  constructor(
    public configService: ConfigService,
    public orderService: OrderService,
    private candleService: CandleService,
    private chartService: ChartService
  ) { }

  ngOnInit() {
    this.orderService.load().subscribe()
  }

  trackOrder(index, order: IOrder): IOrder {
    return order
  }

  onClickRow(order: IOrder): void {
    const symbol = this.candleService.getSymbolByName(order.symbol)
    const chart = this.chartService.createChart('MAIN', symbol, this.chartService.activeInterval$.value);
    this.chartService.showChart(chart.id);
  }
}
