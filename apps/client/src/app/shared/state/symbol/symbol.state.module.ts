import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SymbolState } from './symbol.state';

@NgModule({
  imports: [NgxsModule.forFeature([SymbolState])],
  //   providers: [Logger],
  //   exports: [AppComponent],
})
export class SymbolStateModule {}
