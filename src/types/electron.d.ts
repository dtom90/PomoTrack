export interface ElectronAPI {
  onMessage: (callback: (message: unknown) => void) => void;
  checkForUpdates: () => Promise<unknown>;
}
