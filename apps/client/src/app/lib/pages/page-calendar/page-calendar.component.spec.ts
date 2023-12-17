import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageNewsComponent } from './page-calendar.component';
import { NgxsModule } from '@ngxs/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PageNewsComponent', () => {
  let component: PageNewsComponent;
  let fixture: ComponentFixture<PageNewsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        NgxsModule.forRoot([]),
        PageNewsComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
