import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatRadioModule } from '@angular/material/radio'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatTableModule } from '@angular/material/table'
import { MatSortModule } from '@angular/material/sort'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatTabsModule } from '@angular/material/tabs'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ResizableModule } from 'angular-resizable-element';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ResizableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ResizableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatTableModule,
    MatSortModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
    // MatSnackBarModule,

  ]
})
export class SharedModule { }
