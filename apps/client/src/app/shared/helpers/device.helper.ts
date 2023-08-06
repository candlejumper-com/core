

export const isProd = document.location.host.endsWith('easy-nft.app');
export const isProdDev = document.location.host.startsWith('dev.easy-nft.app');
export const isIOS = navigator.userAgent.match(/iPhone|iPad|iPod/);
export const isAndroid = navigator.userAgent.match(/Android/);
export const isApp = false
export const isMobile = false
export const isPWA = typeof window.matchMedia === 'function' ? (matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && !navigator['standalone'])) : false;
export const browserName = getBrowserName()
export const isElectron = checkIsElectron()
export const BASE_HREF = isProd ? '/public/apps/easynft/' : '';

declare let window: any
declare let process: any

function getBrowserName(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.match(/chrome|chromium|crios/i)) {
        return "chrome";
    }

    if (userAgent.match(/firefox|fxios/i)) {
        return "firefox";
    }

    if (userAgent.match(/safari/i)) {
        return "safari";
    }

    if (userAgent.match(/opr\//i)) {
        return "opera";
    }

    if (userAgent.match(/edg/i)) {
        return "edge";
    }

    return null;
}

function checkIsElectron() {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process['type'] === 'renderer') {
      return true;
  }

  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions['electron']) {
      return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
      return true;
  }

  return false;
}
