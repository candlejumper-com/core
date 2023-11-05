import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FooterTabBacktestComponent } from './footer-tab-backtest.component'
import { NgxsModule, Store } from '@ngxs/store'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { ConfigState } from '../../../state/config/config.state'
import { CONFIG_SET } from '../../../state/config/config.actions'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

describe('FooterTabBacktestComponent', () => {
  let component: FooterTabBacktestComponent
  let fixture: ComponentFixture<FooterTabBacktestComponent>
  let store: Store

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FooterTabBacktestComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        NgxsModule.forRoot([ConfigState]),
      ],
    }).compileComponents()

    store = TestBed.inject(Store)
    store.dispatch(new CONFIG_SET({ system: { symbols: [], intervals: [], bots: [] }, availableBots: [] }))

    fixture = TestBed.createComponent(FooterTabBacktestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
