import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { StatusService } from '../../services/status/status.service';
import { WindowService } from '../../services/window/window.service';
import { SharedModule } from '../../shared.module';
import { FooterTabBacktestComponent } from './footer-tab-backtest/footer-tab-backtest.component';
import { FooterTabBalancesComponent } from './footer-tab-balances/footer-tab-balances.component';
import { FooterTabBotsComponent } from './footer-tab-bots/footer-tab-bots.component';
import { FooterTabEditorComponent } from './footer-tab-editor/footer-tab-editor.component';
import { FooterTabLogsComponent } from './footer-tab-logs/footer-tab-logs.component';
import { FooterTabOrdersComponent } from './footer-tab-orders/footer-tab-orders.component';
import { FooterTabSettingsComponent } from './footer-tab-settings/footer-tab-settings.component';
import { FooterTabStatusComponent } from './footer-tab-status/footer-tab-status.component';
import { OrderService } from '../../services/order/order.service';
import { ProfileService } from '../../services/profile/profile.service';
import { StateService } from '../../services/state/state.service';

export const enum FOOTER_TAB {
  'balances' = 'balances',
  'trades' = 'trades',
  'events' = 'events',
  'bots' = 'bots',
  'backtest' = 'backtest',
  'logs' = 'logs',
  'settings' = 'settings',
  'editor' = 'editor',
  'status' = 'status',
}

@Component({
  standalone: true,
  selector: 'app-footer-tabs',
  templateUrl: './footer-tabs.component.html',
  styleUrls: ['./footer-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SharedModule,
    FooterTabBalancesComponent,
    FooterTabBotsComponent,
    FooterTabBacktestComponent,
    FooterTabEditorComponent,
    FooterTabOrdersComponent,
    FooterTabLogsComponent,
    FooterTabSettingsComponent,
    FooterTabStatusComponent
  ]
})
export class FooterTabsComponent {

  activeTab: FOOTER_TAB
  balanceTotalUSDT: number
  toggleIcon: string

  tabs: [FOOTER_TAB, string?][] = [
    [FOOTER_TAB.balances, 'wallet'],
    [FOOTER_TAB.trades, 'shopping_cart_checkout'],
    [FOOTER_TAB.bots, 'android'],
    [FOOTER_TAB.backtest, 'science'],
    [FOOTER_TAB.settings, 'settings'],
    [FOOTER_TAB.editor, 'code'],
    [FOOTER_TAB.logs, 'dehaze'],
    [FOOTER_TAB.status],
  ]

  private minHeight = 300
  private updateInterval

  constructor(
    public elementRef: ElementRef,
    public profileService: ProfileService,
    public stateService: StateService,
    public statusService: StatusService,
    public orderService: OrderService,
    private windowService: WindowService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
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


  toggleVisibility(): void {
    const height = this.elementRef.nativeElement.clientHeight

    // if footer height is < then increase footer height
    if (height < this.minHeight) {
      this.elementRef.nativeElement.style.height = this.minHeight + 'px'
    }

    else {
      this.elementRef.nativeElement.style.height = 0
    }

    this.setToggleIcon()
  }

  onResizeStart() {
    this.windowService.isResizing = true
  }

  onResizeEnd(event: ResizeEvent): void {
    this.windowService.isResizing = false
    this.elementRef.nativeElement.parentNode.classList.remove('resizing')
    this.elementRef.nativeElement.style.height = event.rectangle.height + 'px'
    this.profileService.profile.settings.client.footer.size = event.rectangle.height
    this.profileService.store()

    requestAnimationFrame(() => this.setToggleIcon())
  }

  toggleTab(tab: FOOTER_TAB): void {
    this.ensureMinimumHeight()
    this.activeTab = tab
    this.profileService.profile.settings.client.footer.activeTab = tab
    this.profileService.store()

    this.orderService.newOrders$.next(0)
  }

  private setToggleIcon(): void {
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
    this.activeTab = this.profileService.profile.settings.client.footer.activeTab
    this.elementRef.nativeElement.style.height = this.profileService.profile.settings.client.footer.size + 'px'
  }

  private startUpdateInterval() {
    this.updateInterval = setInterval(() => {
      this.changeDetectorRef.detectChanges()
    }, 500)
  }
}
