import { Component, ViewChild } from '@angular/core';
import { EditorCodeComponent } from './editor-code/editor-code.component';
import { FileTreeComponent } from './editor-file-tree/editor-file-tree.component';
import { EditorFooterComponent } from './editor-footer/editor-footer.component';
import { EditorService } from '../../../shared/services/editor/editor.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  templateUrl: './page-editor.component.html',
  styleUrls: ['./page-editor.component.scss'],
  standalone: true,
  imports: [SharedModule, EditorFooterComponent, EditorCodeComponent, FileTreeComponent]
})
export class PageEditorComponent {

  @ViewChild(EditorFooterComponent)
  private footerRef: EditorFooterComponent

  constructor(
    public editorService: EditorService
  ) {}

  toggleTab(file: any, event: MouseEvent) {
    event?.preventDefault()

    this.editorService.openTab(file)
  }

  closeTab(symbol: any, event: MouseEvent) {
    event?.preventDefault()

    this.editorService.closeTab(symbol)
  }

  saveAll(): any {
    return this.editorService.saveAll().subscribe()
  }

  doBacktest(): void {
    this.editorService.saveAll().subscribe({
      next: () => this.footerRef.toggleTab('backtest' as any, {force: true})
    })

  }
}
