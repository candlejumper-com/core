import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ORDER_SIDE, OrderService } from '../../services/order/order.service';
import { SharedModule } from '../../shared.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ISymbol } from '@candlejumper/shared';

export interface IOrderDialogData {
  symbol: ISymbol
  type: ORDER_SIDE
}

@Component({
  selector: 'core-dialog-order',
  templateUrl: './dialog-order.component.html',
  styleUrls: ['./dialog-order.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule
  ]
})
export class DialogOrderComponent {

  form = new FormGroup({
    amount: new FormControl(0, [Validators.required]),
  })

  constructor(
    public dialogRef: MatDialogRef<DialogOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IOrderDialogData,
    private orderService: OrderService,
  ) {}

  onClickAll() {
    // const amount = this.type
  }


  onClickAccept() {
    this.orderService.order(this.data.symbol, this.data.type, this.form.value.amount).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: () => {
        alert('error')
      }
    })
  }
}
