import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SymbolOverviewComponent } from './symbol-overview.component';
import { NgxsModule } from '@ngxs/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('SymbolOverviewComponent', () => {
  let component: SymbolOverviewComponent;
  let fixture: ComponentFixture<SymbolOverviewComponent>;

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

    fixture = TestBed.createComponent(SymbolOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
