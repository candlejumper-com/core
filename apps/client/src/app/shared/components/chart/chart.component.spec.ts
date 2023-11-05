import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartComponent } from './chart.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule, Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { ConfigState } from '../../state/config/config.state';
import { CONFIG_SET } from '../../state/config/config.actions';

const CONFIG_STATE_DEFAULT = { system: { symbols: [], intervals: [], bots: [] }, availableBots: [] }

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let store: Store

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        NgxsModule.forRoot([ConfigState]),
        HttpClientTestingModule,
        MatSnackBarModule,
        ChartComponent
      ]
    })
    .compileComponents();

    store = TestBed.inject(Store)
    store.dispatch(new CONFIG_SET(CONFIG_STATE_DEFAULT))
    
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    component.candles = [[1,1,1,1,1,1]]
    component.interval$ = new BehaviorSubject(null)
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
