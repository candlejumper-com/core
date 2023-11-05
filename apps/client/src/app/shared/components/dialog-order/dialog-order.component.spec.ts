/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DialogOrderComponent, IOrderDialogData } from './dialog-order.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { NgxsModule } from '@ngxs/store'
import { ORDER_SIDE } from '../../services/order/order.service'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

describe('DialogOrderComponent', () => {
  let component: DialogOrderComponent
  let fixture: ComponentFixture<DialogOrderComponent>

  const dialogData: IOrderDialogData = {
    symbol: { name: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
    type: ORDER_SIDE.BUY,
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NgxsModule.forRoot([]),
        DialogOrderComponent,
        MatDialogModule,
        HttpClientTestingModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogOrderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
