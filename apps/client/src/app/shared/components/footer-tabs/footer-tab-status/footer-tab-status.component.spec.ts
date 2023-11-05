import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterTabStatusComponent } from './footer-tab-status.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxsModule } from '@ngxs/store';

describe('FooterTabStatusComponent', () => {
  let component: FooterTabStatusComponent;
  let fixture: ComponentFixture<FooterTabStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        NgxsModule.forRoot([]),
        HttpClientTestingModule,
        FooterTabStatusComponent
       ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
