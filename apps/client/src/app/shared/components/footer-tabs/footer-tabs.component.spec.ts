import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterTabsComponent } from './footer-tabs.component';
import { NgxsModule } from '@ngxs/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UserState } from '../../state/user/user.state';

describe('FooterTabsComponent', () => {
  let component: FooterTabsComponent;
  let fixture: ComponentFixture<FooterTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        FooterTabsComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        NgxsModule.forRoot([UserState]),
       ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
