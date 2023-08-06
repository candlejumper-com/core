import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ElementRef } from '@angular/core';
import { MatTreeFlattener, MatTreeFlatDataSource, MatTreeModule } from '@angular/material/tree';
import { ResizeEvent } from 'angular-resizable-element';
import { IFileTreeResponse, EditorService, IEditorFile } from '../../../../shared/services/editor/editor.service';
import { SharedModule } from '../../../../shared/shared.module';

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  path: string
  content: string
}

@Component({
  selector: 'app-editor-file-tree',
  templateUrl: './editor-file-tree.component.html',
  styleUrls: ['./editor-file-tree.component.scss'],
  standalone: true,
  imports: [SharedModule, MatTreeModule]
})
export class FileTreeComponent {

  fileTree: IFileTreeResponse[]

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  constructor(
    public elementRef: ElementRef,
    public editorService: EditorService
  ) { }

  ngOnInit(): void {
    this.editorService.getFileTree().subscribe({
      next: result => {
        this.fileTree = result
        this.dataSource.data = this.fileTree
        this.treeControl.expandAll()
      }
    })
  }

  onClickNode(node: IEditorFile) {
    this.editorService.openTab(node)
  }

  onResize(event) {
    // console.log(event)
  }

  onResizeEnd(event: ResizeEvent) {
    this.elementRef.nativeElement.style.width = event.rectangle.width + 'px'
    // this.profileService.profile.settings.client.footer.size = event.rectangle.height
    // this.profileService.store()
  }

  private _transformer = (node: IFileTreeResponse, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      path: node.path,
      content: node.content
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
}
