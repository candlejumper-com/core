import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAuthRegistrateComponent } from '../../dialog-auth-registrate/dialog-auth-registrate.component';
import { DialogAuthComponent } from '../../dialog-auth/dialog-auth.component';
import { ProfileService } from '../../../services/profile/profile.service';
import { StatusService } from '../../../services/status/status.service';
import { IUser, UserService } from '../../../services/user/user.service';
import { SharedModule } from '../../../shared.module';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserState } from '../../../state/user/user.state';

@Component({
  selector: 'core-footer-tab-status',
  templateUrl: './footer-tab-status.component.html',
  styleUrls: ['./footer-tab-status.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class FooterTabStatusComponent {

  @Select(UserState.get) user$: Observable<IUser>

  constructor(
    public statusService: StatusService,
    public userService: UserService,
    private profileService: ProfileService,
    public dialog: MatDialog
  ) {}

  openAuthDialog(): void {
    const dialogRef = this.dialog.open(DialogAuthComponent)

    dialogRef.afterClosed().subscribe(result => {
      if (result?.registrate) {
        this.openRegistrateDialog()
      }
    })
  }

  openRegistrateDialog() {
    const dialogRef = this.dialog.open(DialogAuthRegistrateComponent)

    dialogRef.afterClosed().subscribe(result => {
      alert(2)
    });
  }
}
