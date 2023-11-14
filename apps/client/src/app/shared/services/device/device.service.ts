import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { browserName, isAndroid, isApp, isIOS, isMobile, isPWA } from '../../helpers/device.helper';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  version = window.__APP_VERSION__;
  appInstallButtonType: 'android' | 'ios' | 'pwa' = null;

  showPWABanner$ = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient ) {}

  async init() {
    try {
      // this.setInstallAppButtonType();

      setTimeout(async () => {
        await this.initFirebase();
      }, 10000)

    } catch (error) {
      console.error(error)
    }
  }

  async initFirebase() {

    // TODO: Replace the following with your app's Firebase project configuration
    // See: https://firebase.google.com/docs/web/learn-more#config-object
    const firebaseConfig = {
      apiKey: "AIzaSyAVr1RmPpgSUGuAMS7y1t7aK16lG78zVIM",
      authDomain: "tradebot-ce742.firebaseapp.com",
      projectId: "tradebot-ce742",
      storageBucket: "tradebot-ce742.appspot.com",
      messagingSenderId: "991998010613",
      appId: "1:991998010613:web:524da2fb9381104aa5d1bc"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Firebase Cloud Messaging and get a reference to the service
    const messaging = getMessaging(app);

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // ...
    });

    const currentToken = await getToken(messaging, { vapidKey: 'BAsHexhMADBsIxdW87DUAMN54Do04kHZ7L1ZlyNsTr2eJ6hGtI7qM2ANHjsaqL8GIoIY6ewgUlVZaCaM9OLd6b4' })

    if (currentToken) {
      this.onPushEnableSave(currentToken).subscribe()
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  }

  onPushEnableSave(fcmToken: string): Observable<any> {
    return this.httpClient.post('/api/device', { fcmToken, browserName })
  }

  async installPWA(): Promise<void> {
    if (!window.app.pwa?.promptEvent) {
      return;
    }

    window.app.pwa.promptEvent.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await window.app.pwa.promptEvent.userChoice;

    if (outcome === 'accepted') {
      window.app.pwa.promptEvent = null;
      window.localStorage.removeItem('PWA_BANNER_CLOSED');
    }
  }

  setPWABannerClosed(): void {
    this.showPWABanner$.next(false);
    window.localStorage.setItem('PWA_BANNER_CLOSED', '1');
  }

  private setInstallAppButtonType(): void {
    if (isPWA) {
      return;
    }

    // mobile
    if (isMobile) {
      if (!isApp) {
        if (isAndroid) {
          this.appInstallButtonType = 'android';
        }

        else if (isIOS) {
          this.appInstallButtonType = 'pwa';
        }

        // TODO - check if PWA is supported
        else {
          this.appInstallButtonType = 'pwa';
        }
      }
    }

    // desktop
    else {
      this.appInstallButtonType = 'pwa';
    }

    // show install pwa banner
    if (this.appInstallButtonType === 'pwa') {
      this.showPWABanner$.next(!window.localStorage.getItem('PWA_BANNER_CLOSED'));
    }
  }
}
