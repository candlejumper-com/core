import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAuthRegistrateComponent } from '../../dialog-auth-registrate/dialog-auth-registrate.component';
import { DialogAuthComponent } from '../../dialog-auth/dialog-auth.component';
import { ProfileService } from '../../../services/profile/profile.service';
import { UserService } from '../../../services/user/user.service';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-footer-tab-settings',
  templateUrl: './footer-tab-settings.component.html',
  styleUrls: ['./footer-tab-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule]
})
export class FooterTabSettingsComponent {

  constructor(
    public userService: UserService,
    private profileService: ProfileService,
    public dialog: MatDialog
  ) {}

  resetLocalProfile(): void {
    const confirmed = confirm("This will reset all local profile settings (can't do much harm)")
    if (confirmed) {
      this.profileService.profile = {}
      this.profileService.store()

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
