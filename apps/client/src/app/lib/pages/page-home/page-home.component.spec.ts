import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHomeComponent } from './page-home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule } from '@ngxs/store';
import { UserState } from '../../../shared/state/user/user.state';

describe('PageHomeComponent', () => {
  let component: PageHomeComponent;
  let fixture: ComponentFixture<PageHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        PageHomeComponent,
        NgxsModule.forRoot([]),
        NgxsModule.forFeature([UserState]),
        HttpClientTestingModule,
        MatSnackBarModule
       ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
