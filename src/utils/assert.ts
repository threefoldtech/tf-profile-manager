function panic(message: string): never {
  throw new Error(message);
}

export function assertInstalled(): void | never {
  if (!window.profileManager) {
    panic('Profile Manager is not installed.');
  }
}
