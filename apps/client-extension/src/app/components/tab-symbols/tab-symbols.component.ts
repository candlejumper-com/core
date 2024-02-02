import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ISymbol } from '@candlejumper/shared';
import { SymbolService } from '../../services/symbol/symbol.service';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'trade-tab-symbols',
  templateUrl: './tab-symbols.component.html',
  // styleUrls: ['./tab-symbols.component.scss'],
  styleUrls: ['./tab-symbols.component.scss', '../../../../../../node_modules/bootstrap/scss/bootstrap.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatTabsModule],
  // encapsulation: ViewEncapsulation.None
})
export class TabSymbolsComponent implements OnInit {

  abs = Math.abs

  symbols: ISymbol[] = []

  categoryForm = this.formBuilder.group({
    category: this.formBuilder.group({
      CRT: new FormControl(true),
      FX: new FormControl(true),
      STC: new FormControl(true),
    }),
  });

  private _symbols: ISymbol[] = []
  private searchValue: string = ''

  constructor(private symbolService: SymbolService, private formBuilder: FormBuilder) { }

  async ngOnInit() {
    const symbols = await this.symbolService.load()
    console.log(symbols)
    this._symbols = this.symbols = symbols
    // this._symbols = this.symbols = symbols.filter(symbol => !!symbol.insights)

    this.categoryForm.valueChanges.subscribe(() => {
      this.search()
    })
  }

  search(query?: Event) {
    const categoryValue = this.categoryForm.controls.category.value
    const categories = Object.keys(this.categoryForm.controls.category.value).filter(key => categoryValue[key])

    this.searchValue = (query?.target as HTMLInputElement)?.value?.toLowerCase() || this.searchValue
    this.symbols = this._symbols.filter(symbol => {

      return symbol.name.toLowerCase().includes(this.searchValue) && (categories.includes(symbol.category) || !symbol.category)
    })
  }
}
