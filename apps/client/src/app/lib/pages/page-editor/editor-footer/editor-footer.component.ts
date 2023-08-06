import { ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { FooterTabBacktestComponent } from '../../../../shared/components/footer-tabs/footer-tab-backtest/footer-tab-backtest.component';
import { FooterTabBalancesComponent } from '../../../../shared/components/footer-tabs/footer-tab-balances/footer-tab-balances.component';
import { OrderService } from '../../../../shared/services/order/order.service';
import { ProfileService } from '../../../../shared/services/profile/profile.service';
import { StateService } from '../../../../shared/services/state/state.service';
import { SharedModule } from '../../../../shared/shared.module';


export const enum EDITOR_FOOTER_TAB {
  'balances' = 'balances',
  'trades' = 'trades',
  'events' = 'events',
  'bots' = 'bots',
  'backtest' = 'backtest',
  'automize' = 'automize',
  'logs' = 'logs',
  'settings' = 'settings',
  'editor' = 'editor',
  'status' = 'status',
}

@Component({
  selector: 'app-editor-footer',
  templateUrl: './editor-footer.component.html',
  styleUrls: ['./editor-footer.component.scss'],
  standalone: true,
  imports: [SharedModule, FooterTabBalancesComponent, FooterTabBacktestComponent]
})
export class EditorFooterComponent {

  activeTab: EDITOR_FOOTER_TAB
  balanceTotalUSDT: number
  toggleIcon: string

  tabs: [EDITOR_FOOTER_TAB, string][] = [
    [EDITOR_FOOTER_TAB.balances, 'wallet'],
    [EDITOR_FOOTER_TAB.backtest, 'science'],
  ]

  // temp
  tabOptions: any

  private minHeight = 300
  private updateInterval

  constructor(
    public elementRef: ElementRef,
    public profileService: ProfileService,
    public stateService: StateService,
    public orderService: OrderService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.setFromProfile()
    this.startUpdateInterval()
    this.setToggleIcon()
    // attempt to cancel
    // this.elementRef.nativeElement.ontouchmove = function (event) {
    //   event.preventDefault()
    //   event.stopPropagation()
    // }
  }

  ngOnDestroy(): void {
    clearInterval(this.updateInterval)
  }

  toggleVisibility() {
    const height = this.elementRef.nativeElement.clientHeight

    // if footer height is < then
    // increase footer height
    if (height < this.minHeight) {
      this.elementRef.nativeElement.style.height = this.minHeight + 'px'
    }

    else {
      this.elementRef.nativeElement.style.height = 0
    }

    this.setToggleIcon()
  }

  onResize(event) {
    // console.log(event)
  }

  onResizeEnd(event: ResizeEvent) {
    this.elementRef.nativeElement.style.height = event.rectangle.height + 'px'
    this.profileService.profile.settings.client.footer.size = event.rectangle.height
    this.profileService.store()

    requestAnimationFrame(() => this.setToggleIcon())
  }

  toggleTab(tab: EDITOR_FOOTER_TAB, options?: any): void {
    this.tabOptions = options || null
    this.ensureMinimumHeight()
    this.activeTab = null

    setTimeout(() => {
      this.activeTab = tab
    })
    // this.profileService.profile.settings.client.footer.activeTab = tab
    // this.profileService.store()

    // this.orderService.newOrders$.next(0)
  }

  private setToggleIcon() {
    const height = this.elementRef.nativeElement.clientHeight
    this.toggleIcon = height >= this.minHeight ? 'arrow_downwards' : 'arrow_upwards'
  }

  private ensureMinimumHeight(): void {
    const currentHeight = this.elementRef.nativeElement.clientHeight

    if (currentHeight < this.minHeight) {
      this.elementRef.nativeElement.style.height = this.minHeight + 'px'
    }

    this.setToggleIcon()
  }

  private setFromProfile(): void {
    // this.activeTab = this.profileService.profile.settings.client.footer.activeTab
    this.elementRef.nativeElement.style.height = this.profileService.profile.settings.client.footer.size + 'px'
  }

  private startUpdateInterval() {
    this.updateInterval = setInterval(() => {
      this.changeDetectorRef.detectChanges()
    }, 500)
  }
}
