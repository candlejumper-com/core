import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NxWelcomeComponent } from './nx-welcome.component'
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import { CommonModule } from '@angular/common'

declare let chrome: any

@Component({
  standalone: true,
  imports: [CommonModule, NxWelcomeComponent, RouterModule],
  selector: 'candlejumper-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppComponent {
  symbols = []

  abs = Math.abs

  async ngOnInit() {

    chrome?.tabs?.query({}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.executeScript(tabs[i].id, { file: 'cursor.js' })
      }
    })

    if (chrome?.tabs) {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: items => {
          const div = document.createElement('div')
          div.style.background = 'red'
          div.style.height = '100px'
          div.style.width = '100px'
          document.body.appendChild(div)
          console.log(document.body)
          console.log(222)
        },
        args: [[]], // pass any parameters to function)
      })
    }

    await this.getTrendingSymbols()
  }

  async getTrendingSymbols() {
    const req = await fetch('http://localhost:3000/api/app-init')
    const { state } = await req.json()

    this.symbols = state.symbols.filter(symbol => !!symbol.insights)

    this.symbols.forEach(symbol => {
      const reportDate = symbol.calendar?.[0]?.reportDate
      symbol.reportDateString = reportDate ? format(new Date(reportDate), 'yyyy-MM-dd') : 'N/A'
    })
  }
}
