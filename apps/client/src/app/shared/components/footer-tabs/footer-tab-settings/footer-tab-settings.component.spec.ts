import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTabSettingsComponent } from './footer-tab-settings.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxsModule } from '@ngxs/store';

describe('FooterTabSettingsComponent', () => {
  let component: FooterTabSettingsComponent;
  let fixture: ComponentFixture<FooterTabSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        NgxsModule.forRoot([]),
        HttpClientTestingModule,
        FooterTabSettingsComponent
       ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterTabSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
