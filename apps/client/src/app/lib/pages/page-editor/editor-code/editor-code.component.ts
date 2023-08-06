import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { first } from 'rxjs'
import { EditorService } from '../../../../shared/services/editor/editor.service';
import { MonacoEditorService } from '../../../../shared/services/monaco/monaco-editor-service';

declare var monaco: any

@Component({
  selector: 'app-editor-code',
  templateUrl: './editor-code.component.html',
  styleUrls: ['./editor-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class EditorCodeComponent implements OnInit, OnDestroy {

  private editor
  private typings

  constructor(
    public editorService: EditorService,
    private elementRef: ElementRef,
    private monacoEditorService: MonacoEditorService
  ) { }

  ngOnInit() {
    this.monacoEditorService.load()
    this.initEditor()

  }

  ngOnDestroy() {
    this.destroyEditor()
  }

  addTypings(files: any[]): void {
    files.forEach(file => {
      monaco.editor.createModel(file.content, 'typescript', monaco.Uri.file(file.path))
    })
  }

  private updateEditorContent(content: string): void {
    this.editor.getModel().setValue(content)
    var doesModelHaveErrors = monaco.editor.getModelMarkers().length != 0
  }

  private initEditor(): void {
    if (!this.monacoEditorService.loaded) {
      this.monacoEditorService.loadingFinished.pipe(first()).subscribe(() => {
        this.initEditor();
      });
      return;
    }

    const defaults = monaco.languages.typescript.javascriptDefaults
    // defaults.setMaximumWorkerIdleTime(-1);
    // defaults.setEagerModelSync(true);

    defaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });

    defaults.setCompilerOptions({
      experimentalDecorators: true,
      allowSyntheticDefaultImports: true,
      // alwaysStrict: true,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      // moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      lib: ["es2020", "ES2020", "dom"],
      // types: ['node']
    });

    this.editorService.loadTypings().subscribe({
      next: (files: any) => {
        this.addTypings(files)

        this.editorService.activeFile$.subscribe({
          next: value => {
            if (value) {

              this.updateEditorContent(value.content)
            }
          }
        })
      }
    })

    // Create the model that we'll reference in our editor model
    // monaco.editor.createModel(temp, 'typescript', monaco.Uri.file('../../../../lib/server/dist/bot/bot.ts'))

    // Create the editor model
    var editorModel = monaco.editor.createModel(this.editorService.activeFile$.value?.content, 'typescript', monaco.Uri.file('main.ts'))

    this.editor = monaco.editor.create(this.elementRef.nativeElement, {
      model: editorModel,
      // value: [this.editorService.activeFile$.value?.content].join('\n'),
      language: 'typescript',
      theme: 'vs-dark',
      automaticLayout: true // <<== the important part
    });

    // monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    //   allowJs: true,
    //   allowSyntheticDefaultImports: true,
    //   // alwaysStrict: true,
    //   target: monaco.languages.typescript.ScriptTarget.ES5,
    //   // module: monaco.languages.typescript.ModuleKind.System
    // });

    // monaco.editor.setTheme('vs-dark')

    this.editor.getModel().onDidChangeContent((e) => {
      if (e.isFlush) {
        // true if setValue call
      } else {
        this.editorService.activeFile$.value.changed = true
      }

      this.editorService.activeFile$.value.content = this.editor.getValue()
    })
  }

  private loadTerminal() {
    // load terminal
    // var term = new Terminal();
    // term.open(document.getElementById('terminal'));
    // term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
  }

  private destroyEditor(): void {
    monaco.editor.getModels().forEach(model => model.dispose())
    this.editor = null
  }
}
