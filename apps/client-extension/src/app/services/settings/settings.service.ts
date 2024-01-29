import { Injectable } from '@angular/core'

export interface ITabSettings {
  symbolTypes?: string[]
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor() {}

  async toggleBanner(value: boolean) {
    const tabs = await chrome.tabs.query({})
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      if (tab.status !== 'complete') {
        continue
      }
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'visibility', data: { visible: value } })
      } catch (error) {
        console.log(tab)
        console.error(error)
      }
    }
  }

  async updateBannerSettings(settings: ITabSettings) {
    console.log(34334, settings)
    const tabs = await chrome.tabs.query({})
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      if (tab.status !== 'complete') {
        continue
      }
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'updateBannerSettings', data: settings })
      } catch (error) {
        console.log(tab)
        console.error(error)
      }
    }
  }
}
