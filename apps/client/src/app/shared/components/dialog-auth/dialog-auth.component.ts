import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { UserService } from '../../services/user/user.service';
import { SharedModule } from '../../shared.module';

@Component({
  templateUrl: './dialog-auth.component.html',
  styleUrls: ['./dialog-auth.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class DialogAuthComponent {

  error$ = new BehaviorSubject<any>(null)
  busy$ = new BehaviorSubject<boolean>(null)

  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  constructor(
    public dialogRef: MatDialogRef<DialogAuthComponent>,
    private userService: UserService,
    private localStorageService: LocalStorageService
  ) { }

  onClickRegistrate() {
    this.dialogRef.close({ registrate: true })
  }

  onClickLogin() {
    this.busy$.next(true)
    this.error$.next(null)
    this.form.disable()

    const formValues = this.form.value

    this.userService.login(formValues.username, formValues.password).subscribe({
      next: result => {
        // store the token
        this.userService.setJWTToken(result.token)

        // show login success popup on reload
        this.localStorageService.set('reload-event', { time: Date.now(), reason: 'login' })

        window.location.reload()
      },
      error: (error: HttpErrorResponse) => {
        this.busy$.next(true)
        this.form.enable()

        switch (error.status) {
          case 401:
            this.error$.next('Wrong username or password')
            break
          default:
            console.error(error)
            this.error$.next(error?.message || error?.error || error)
        }
      }
    })
  }
}
