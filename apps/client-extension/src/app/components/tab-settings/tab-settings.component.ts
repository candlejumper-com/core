import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings/settings.service';

@Component({
  selector: 'trade-tab-settings',
  templateUrl: './tab-settings.component.html',
  styleUrls: ['./tab-settings.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatRadioModule]
})
export class TabSettingsComponent implements OnInit {

  form = new FormGroup({
    showAlways: new FormControl<boolean>(true),
    lastName: new FormControl(''),
  });

  constructor(private settingsService: SettingsService) { }

  async ngOnInit() {
    const result = await chrome.storage.local.get('TRADE_BANNER_SHOW')
    this.form.controls.showAlways.setValue(result['TRADE_BANNER_SHOW'])

    this.form.controls.showAlways.valueChanges.subscribe(async value => {
      await chrome.storage.local.set({'TRADE_BANNER_SHOW': value})
      this.settingsService.toggleBanner(value)
    })
  }
}
