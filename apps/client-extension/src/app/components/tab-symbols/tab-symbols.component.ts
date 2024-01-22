import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ISymbol } from '@candlejumper/shared';
import { SymbolService } from '../../services/symbol/symbol.service';

@Component({
  selector: 'trade-tab-symbols',
  templateUrl: './tab-symbols.component.html',
  styleUrls: ['./tab-symbols.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule]
})
export class TabSymbolsComponent implements OnInit {

  abs = Math.abs

  symbols: ISymbol[] = []

  private _symbols: ISymbol[] = []

  constructor(private symbolService: SymbolService) { }

  async ngOnInit() {
    const symbols = await this.symbolService.load()
    this._symbols = this.symbols = symbols.filter(symbol => !!symbol.insights)
  }

  search(query?: Event) {
    const value = (query?.target as HTMLInputElement)?.value || ''
    this.symbols = this._symbols.filter(symbol => symbol.name.toLowerCase().includes(value.toLowerCase()))
  }
}
