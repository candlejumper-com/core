import { HttpClient } from '@angular/common/http'
import { EventEmitter, Injectable } from '@angular/core'
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar'
import { BehaviorSubject, Observable, tap } from 'rxjs'

export interface IFileTreeResponse {
  name: string
  children: any[]
  path: string
  content: string
}

export interface IFileResponse {
  content: string
}

export interface IEditorFile {
  path: string
  content: string
  name: string
  changed: boolean
}

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  tabs$ = new BehaviorSubject<IEditorFile[]>([])
  activeFile$ = new BehaviorSubject<IEditorFile>(null)

  constructor(private httpClient: HttpClient, private matSnackbar: MatSnackBar) {}

  getFileTree() {
    return this.httpClient.get<IFileTreeResponse[]>('/api/editor/file-tree')
  }

  loadFile(path: string) {
    return this.httpClient.get<IFileResponse>('/api/editor/file/?path=' + path)
  }

  saveAll(): Observable<any> {
    return this.httpClient.put('/api/editor/files', this.tabs$.value).pipe(
      tap(() => {
        this.tabs$.value.forEach((tab) => {
          tab.changed = false
        })
        const config: MatSnackBarConfig = {}
        this.matSnackbar.open('Saved', 'close', { duration: 3000 })
      })
    )
  }

  openTab(file: IEditorFile) {
    this.loadFile(file.path).subscribe({
      next: ({ content }) => {
        // only push if there is no chart open with the same symbol
        file.content = content
        let tab = this.tabs$.value.find((tab) => tab.path === file.path)

        if (tab) {
          tab.content = content
        } else {
          tab = { path: file.path, content, name: file.name, changed: false }
          this.tabs$.value.push(tab)
          this.tabs$.next(this.tabs$.value)
        }

        this.activeFile$.next(tab)
      },
    })
  }

  closeTab(file: IEditorFile) {
    // only close if there are more then 1 charts open
    if (this.tabs$.value.length === 1) {
      return
    }

    const index = this.tabs$.value.findIndex((tab) => tab.path === file.path)
    this.tabs$.value.splice(index, 1)

    // if closed one was also the one active, pick another chart to go active
    if (this.tabs$.value.length) {
      this.openTab(this.tabs$.value[this.tabs$.value.length - 1])
    }
  }

  loadTypings() {
    return this.httpClient.get('/api/editor/typings')
  }
}
