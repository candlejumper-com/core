import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAuthComponent } from './dialog-auth.component';

describe('DialogAuthComponent', () => {
  let component: DialogAuthComponent;
  let fixture: ComponentFixture<DialogAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAuthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
