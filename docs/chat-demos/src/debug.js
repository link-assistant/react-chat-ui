function readFlag() {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const value = params.get('debug');
    if (value === '1' || value === 'true') {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

const enabled = readFlag();

export const debugEnabled = enabled;

export function debugLog(scope, ...args) {
  if (!enabled) {
    return;
  }
  console.debug(`[react-chat-ui:${scope}]`, ...args);
}

export function debugGroup(scope, label, run) {
  if (!enabled) {
    return run();
  }
  console.groupCollapsed(`[react-chat-ui:${scope}] ${label}`);
  try {
    return run();
  } finally {
    console.groupEnd();
  }
}
