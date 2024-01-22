import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { ISymbol } from '@candlejumper/shared'

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (request.greeting === "hello")
//       sendResponse();
//     return true
//   }
// );

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'candlejumper-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppComponent {
  symbols: ISymbol[] = []

  abs = Math.abs

  sendMessages() {
    setInterval(async () => {
      const tabs = await chrome.tabs.query({})
      for (var i = 0; i < tabs.length; i++) {
        // chrome.tabs.connect
        // chrome.tabs.connect(tabs[i].id, { name: 'hello' })
        // const response = await chrome.tabs.sendMessage(tabs[i].id, { greeting: 'hello' })
        // console.log(response)
        // await chrome.tabs.sendMessage(tabs[i].id, { browserActivityState: 2 });

        // do something with response here, not outside the function
        // console.log(response)
        // chrome.tabs.executeScript(tabs[i].id, { file: 'cursor.js' })
      }
    }, 1000)
  }

  async ngOnInit() {
  
    this.sendMessages()
    // const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'hello' })
    // do something with response here, not outside the function
    // console.log(response)

    chrome?.tabs?.query({}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        // chrome.tabs.executeScript(tabs[i].id, { file: 'cursor.js' })
      }
    })

    if (chrome?.tabs) {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      // await chrome.scripting.executeScript({
      //   target: { tabId: tab.id },
      //   func: items => {
      //     const div = document.createElement('div')
      //     div.style.background = 'red'
      //     div.style.height = '100px'
      //     div.style.width = '100px'
      //     document.body.appendChild(div)
      //     console.log(document.body)
      //     console.log(222)
      //   },
      //   args: [[]], // pass any parameters to function)
      // })
    }

    await this.getTrendingSymbols()
  }

  async getTrendingSymbols() {
    const req = await fetch('http://localhost:3000/api/app-init')
    const { state } = await req.json()

    this.symbols = state.symbols.filter((symbol: ISymbol) => !!symbol.insights)

    // this.symbols.forEach(symbol => {
    //   const reportDate = symbol.calendar?.[0]?.reportDate
    //   symbol.reportDateString = reportDate ? format(new Date(reportDate), 'yyyy-MM-dd') : 'N/A'
    // })
  }
}
