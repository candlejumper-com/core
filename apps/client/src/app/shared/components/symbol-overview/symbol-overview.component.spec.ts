import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SymbolOverviewComponent } from './symbol-overview.component';
import { NgxsModule, Store } from '@ngxs/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SymbolState } from '../../state/symbol/symbol.state';

describe('SymbolOverviewComponent', () => {
  let component: SymbolOverviewComponent;
  let fixture: ComponentFixture<SymbolOverviewComponent>;
  let store: Store
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        NgxsModule.forRoot([]),
        HttpClientTestingModule,
        MatSnackBarModule,
        SymbolOverviewComponent 
      ]
    })
    .compileComponents();

    
    store = TestBed.inject(Store)

    fixture = TestBed.createComponent(SymbolOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can find indicator', () => {
    expect(component.findIndicator({ name: 'BTC-USDT' }, '1m')).toEqual(undefined)
  })

  it('updates symbols on input change', () => {
    component.input.name = 'a'
    const symbols = store.selectSnapshot(SymbolState.getFilteredByName('a'))
    expect(component.symbols$.value).toEqual(undefined)
  })
});
