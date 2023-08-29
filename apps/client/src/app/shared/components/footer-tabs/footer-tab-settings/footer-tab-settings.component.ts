import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAuthRegistrateComponent } from '../../dialog-auth-registrate/dialog-auth-registrate.component';
import { DialogAuthComponent } from '../../dialog-auth/dialog-auth.component';
import { ProfileService } from '../../../services/profile/profile.service';
import { IUser, UserService } from '../../../services/user/user.service';
import { SharedModule } from '../../../shared.module';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserState } from '../../../state/user/user.state';

@Component({
  selector: 'core-footer-tab-settings',
  templateUrl: './footer-tab-settings.component.html',
  styleUrls: ['./footer-tab-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule]
})
export class FooterTabSettingsComponent {

  @Select(UserState.get) user$: Observable<IUser>

  constructor(
    public userService: UserService,
    private profileService: ProfileService,
    public dialog: MatDialog
  ) {}

  resetLocalProfile(): void {
    const confirmed = confirm("This will reset all local profile settings (can't do much harm)")
    if (confirmed) {
      this.profileService.profile = {}
      this.profileService.save()

      window.location.reload()
    }
  }

  toggleProductionMode(state: boolean) {
    this.userService.toggleProductionMode(state).subscribe()
  }

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
      console.log('The dialog was closed')
      alert(2)
    });
  }
}
