import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  breakpoints = {
    sm: 576,
    md: 768,
    lg: 992
  }

  isResizing = false

  constructor(private router: Router) {
    this.init();
  }

  private init(): void {
    this.setTitleRouteListener();
  }

  private setTitleRouteListener(): void {
    this.router.events.subscribe(event => {
      if (event instanceof RoutesRecognized) {
        const data = event.state.root.firstChild.data as any;
        document.title = 'EasyNFT - ' + data.title;
      }
    });
  }
}
