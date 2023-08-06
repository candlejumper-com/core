import { DialogModule } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { UserService } from '../../services/user/user.service';
import { SharedModule } from '../../shared.module';
import { DialogAuthComponent } from '../dialog-auth/dialog-auth.component';

@Component({
  templateUrl: './dialog-auth-registrate.component.html',
  styleUrls: ['./dialog-auth-registrate.component.scss'],
  standalone: true,
  imports: [SharedModule, DialogModule]
})
export class DialogAuthRegistrateComponent {

  error$ = new BehaviorSubject<any>(null)
  busy$ = new BehaviorSubject<boolean>(null)

  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    broker: new FormControl('binance', [Validators.required]),
    brokerAPIKey: new FormControl('', [Validators.required]),
    brokerAPISecret: new FormControl('', [Validators.required]),
  })

  constructor(
    public dialogRef: MatDialogRef<DialogAuthComponent>,
    private userService: UserService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.form.updateValueAndValidity()
  }

  onClickRegistrate(): void {
    this.userService.create(this.form.value).subscribe({
      next: result => {
        // store the token
        this.userService.setJWTToken(result.token)

        // show login success popup on reload
        this.localStorageService.set('reload-event', { time: Date.now(), reason: 'login' })

        window.location.reload()
      },
      error: (error: any) => {
        this.busy$.next(true)
        this.form.enable()

        switch (error.status) {
          case 500:
            this.error$.next('Something went wrong')
            break
          default:
            console.error(error)
            this.error$.next(error?.message || error?.error || error)
        }
      }
    })
  }
}
