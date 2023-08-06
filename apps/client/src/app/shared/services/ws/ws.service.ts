import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface IWSResponse<T> {
  result?: T
  error?: any
}

@Injectable({
  providedIn: 'root'
})
export class WSService {

  error$ = new BehaviorSubject<boolean>(false)

  socket: Socket

  constructor(private snackBar: MatSnackBar) { }

  init(): void {
    // start connection
    this.socket = io({
      reconnection: true
    });

    // on connection
    this.socket.on('connect', () => console.info('WS Connected'))

    this.socket.io.on('reconnect', () => {
      const snackbar = this.snackBar.open('Reconnected', null, {
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: ['success-snackbar']
      })

      snackbar.onAction().subscribe(() => window.location.reload())

      setTimeout(() => window.location.reload(), 1000)
    })

    // on connection error
    // show error popup
    this.socket.on('disconnect', () => {
      this.error$.next(true)

      const snackbar = this.snackBar.open('Connection lost.. Reconnecting', null, {
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: ['error-snackbar']
      })

      snackbar.onAction().subscribe(() => window.location.reload())
    })
  }
}
