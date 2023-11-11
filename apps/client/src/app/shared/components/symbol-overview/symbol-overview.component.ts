import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { BehaviorSubject, Observable, Subscription, map, tap } from 'rxjs'
import { SharedModule } from '../../shared.module'
import { IndicatorService } from '../../services/indicator/indicator.service'
import { CandleService } from '../../services/candle/candle.service'
import { ChartService } from '../../services/chart/chart.service'
import { WindowService } from '../../services/window/window.service'
import { ISymbol } from '@candlejumper/shared'
import { Select, Store, ofActionSuccessful } from '@ngxs/store'
import { SymbolState } from '../../state/symbol/symbol.state'
import { SymbolStateModule } from '../../state/symbol/symbol.state.module'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'core-symbol-overview',
  templateUrl: './symbol-overview.component.html',
  styleUrls: ['./symbol-overview.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule, SymbolStateModule, FormsModule],
})
export class SymbolOverviewComponent implements OnInit, OnDestroy {


  // symbols$ = this.store.select(SymbolState.getFilteredByName(value)
  symbols$: any
  isVisible = window.document.body.clientWidth >= this.windowService.breakpoints.lg
  isExpanded: boolean
  
  input = {
    name: ''
  }      

  private tickSubscription: Subscription

  constructor(
    public elementRef: ElementRef,
    public chartService: ChartService,
    public indicatorService: IndicatorService,
    private changeDectorRef: ChangeDetectorRef,
    private candleService: CandleService,
    private windowService: WindowService,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.symbols$ = this.store.select(SymbolState.getFilteredByName(''))

    // initial visibility
    this.toggleVisibility(this.isVisible)

    // start listening to price changes
    this.tickSubscription = this.candleService.tick$.subscribe(() => this.onPriceTick())
  }

  ngOnDestroy(): void {
    this.tickSubscription?.unsubscribe()
  }

  findIndicator(symbol: ISymbol, interval: string) {
    return this.indicatorService.indicators.find(
      (indicator) => indicator.symbol.name === symbol.name && indicator.interval === interval,
    )
  }

  toggleVisibility(state = !this.isVisible): void {
    this.isVisible = state
    this.elementRef.nativeElement.classList.toggle('visible', this.isVisible)
  }

  onClickSymbol(event: MouseEvent): void {
    const symbolName = (event.target as HTMLElement).closest('tr')?.dataset['symbol']
    const symbol = symbolName ? this.candleService.getSymbolByName(symbolName) : null

    if (symbolName) {
      if (window.document.body.clientWidth < this.windowService.breakpoints.lg) {
        this.toggleVisibility(false)
      }

      const chart = this.chartService.createChart('MAIN', symbol, this.chartService.activeInterval$.value)
      this.chartService.showChart(chart.id)
    }
  }

  toggleExpanded(): void {
    this.elementRef.nativeElement.classList.toggle('expanded', (this.isExpanded = !this.isExpanded))
  }

  onPriceTick(): void {
    if (this.isVisible) {
      this.changeDectorRef.detectChanges()
    }
  }

  onSearchInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase()
    // this.symbols = this.candleService.symbols.filter((symbol) => symbol.name.toLowerCase().includes(value))
    this.symbols$ = this.store.select(SymbolState.getFilteredByName(value));
    // this.symbols$ = this.store.select(SymbolState.getFilteredByName).pipe(map((filterFn) => filterFn(value)))
  }
}
