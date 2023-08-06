import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAuthRegistrateComponent } from './dialog-auth-registrate.component';

describe('DialogAuthRegistrateComponent', () => {
  let component: DialogAuthRegistrateComponent;
  let fixture: ComponentFixture<DialogAuthRegistrateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAuthRegistrateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAuthRegistrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
