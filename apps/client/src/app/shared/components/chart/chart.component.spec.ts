import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartComponent } from './chart.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';

let windowSpy;

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  beforeEach(async () => {
    windowSpy = jest.spyOn(window, "window", "get");
    windowSpy.mockImplementation(() => ({
      anychart: {
        data: {
          table: () => {
            return {
              addData: () => {
                //
              },
              mapAs: () =>{
                //
              }
            }
          }
        },
        theme: () => {
          return "dark";
        },
        stock: () => {
          return {
            padding: () => {
              //
            },
            credits: () => {
              return {
                enabled: () => {
                  //
                }
              }
            },
            plot: () => {
              return {
                candlestick: () => {
                  //                  
                },
                legend: () => {
                  //
                },
                title: () => {
                  //
                },
                xAxis: () => {
                  return {
                    labels: () => {
                      //
                    }
                  }
                },
                yAxis: () => {
                  return {
                    labels: () => {
                      //
                    },
                    orientation: () => {
                      //
                    },
                  }
                },
              }
            }
          }
        }
      }
    }));

    await TestBed.configureTestingModule({
      imports: [ 
        NgxsModule.forRoot(),
        HttpClientTestingModule,
        MatSnackBarModule,
        ChartComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    component.interval$ = new BehaviorSubject(null)
    fixture.detectChanges();
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
