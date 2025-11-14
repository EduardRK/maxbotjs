class MaxBridgeService {
  constructor() {
    this.isMax = typeof window.WebApp !== 'undefined';
    this.webApp = this.isMax ? window.WebApp : null;
    this.initData = null;
  }

  async initialize() {
    if (!this.isMax) return null;
    
    this.webApp.ready();
    this.initData = this.webApp.initDataUnsafe;
    return this.initData;
  }

  getAuthHeaders() {
    if (!this.isMax || !this.initData) return {};
    
    return {
      'X-Max-InitData': JSON.stringify(this.initData)
    };
  }

  showBackButton() {
    if (this.isMax) {
      this.webApp.BackButton.show();
    }
  }

  hideBackButton() {
    if (this.isMax) {
      this.webApp.BackButton.hide();
    }
  }

  setupBackButton(callback) {
    if (this.isMax) {
      this.webApp.BackButton.onClick(callback);
    }
  }

  closeApp() {
    if (this.isMax) {
      this.webApp.close();
    }
  }

  vibrate(type = 'light') {
    if (this.isMax) {
      this.webApp.HapticFeedback.impactOccurred(type);
    }
  }
}

export const maxBridge = new MaxBridgeService();