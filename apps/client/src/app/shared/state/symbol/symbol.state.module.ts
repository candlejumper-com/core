import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { SymbolState } from './symbol.state';

@NgModule({
  imports: [NgxsModule.forFeature([SymbolState])],
  //   providers: [Logger],
  //   exports: [AppComponent],
})
export class SymbolStateModule {}
