import type { ProfileManagerStore } from './public_api';

declare global {
  export interface Window {
    profileManager: ProfileManagerStore;
  }
}
