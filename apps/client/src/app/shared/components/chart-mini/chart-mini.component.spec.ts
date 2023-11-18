import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ChartMiniComponent } from './chart-mini.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { NgxsModule } from '@ngxs/store'
import { BehaviorSubject } from 'rxjs'

describe('ChartMiniComponent', () => {
  let component: ChartMiniComponent
  let fixture: ComponentFixture<ChartMiniComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ChartMiniComponent, HttpClientTestingModule, NgxsModule.forRoot([])],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartMiniComponent)
    component = fixture.componentInstance
    component.interval$ = new BehaviorSubject('1d')
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
