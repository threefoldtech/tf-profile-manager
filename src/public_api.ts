export type Unsubscribe = () => void;
export type Listener = (profile: Profile | null) => void;
export interface ProfileManagerStore {
  subscribe(cb: Listener): Unsubscribe;
  destroy(): void;
}

export interface Profile {
  id: string;
  name: string;
  mnemonics: string;
  ssh: string;
  network: 'main' | 'dev' | 'test' | 'qa';
  disableSSH: boolean;
  twinId: number;
  address: string;
  secret: string;
}

export type HasBalance = {
  balance: { getMyBalance(): Promise<{ free: number; feeFrozen: number }> };
};

export default class ProfileManager {
  static get isInstalled(): Promise<boolean> {
    return new Promise<boolean>((res) => {
      if (window.profileManager) return res(true);
      if (document.readyState === 'complete') return res(false);
      window.addEventListener('load', () => res(!!window.profileManager), {
        once: true,
      });
    });
  }

  static get snapShot(): Profile | null {
    let profile: Profile | null = null;
    const unSubscribe = window.profileManager.subscribe((value) => {
      profile = value;
      unSubscribe();
    });
    return profile;
  }

  static subscribe(listener: Listener): Unsubscribe {
    return window.profileManager.subscribe(listener);
  }

  static destroy(): void {
    return window.profileManager.destroy();
  }

  static getBalance<T extends HasBalance>(
    grid: T
  ): Promise<{ balance: number; locked: number }> {
    return grid.balance
      .getMyBalance()
      .then(({ free, feeFrozen }) => ({ balance: free, locked: feeFrozen }));
  }

  static subscribeToBalance<T extends HasBalance>(
    grid: T,
    cb: (balance: { balance: number; locked: number }) => void,
    interval: number = 60 * 1000
  ): Unsubscribe {
    let _done = false;
    let _clearTimeOut: number;

    function _subscribeToBalance() {
      ProfileManager.getBalance(grid)
        .then((balance) => {
          if (!_done) {
            cb(balance);
            _clearTimeOut = setTimeout(_subscribeToBalance, interval);
          }
        })
        .catch(_subscribeToBalance);
    }

    _subscribeToBalance();

    return () => {
      _done = true;
      if (typeof _clearTimeOut === 'number') {
        clearTimeout(_clearTimeOut);
      }
    };
  }
}
