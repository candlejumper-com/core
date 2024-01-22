import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor() {}

  async toggleBanner(value: boolean) {
    const tabs = await chrome.tabs.query({});
    for (let i=0; i<tabs.length; i++) {
      const tab = tabs[i];
      if (tab.status !== 'complete') {
        continue
      }
      try {
        await chrome.tabs.sendMessage(tab.id, { showBanner: value })
      } catch (error) {
        console.log(tab)
        console.error(error)
      }
    }
  }
}
