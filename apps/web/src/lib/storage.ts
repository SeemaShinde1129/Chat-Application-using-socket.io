const USERNAME_STORAGE_KEY = "quick-talk:username";
const USERNAME_STORAGE_EVENT = "quick-talk:username-change";

function getStoredUsername() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(USERNAME_STORAGE_KEY) ?? "";
}

function getStoredUsernameServerSnapshot() {
  return null;
}

function notifyStoredUsernameChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(USERNAME_STORAGE_EVENT));
}

function subscribeToStoredUsername(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleUsernameChange() {
    onStoreChange();
  }

  window.addEventListener(USERNAME_STORAGE_EVENT, handleUsernameChange);

  return () => {
    window.removeEventListener(USERNAME_STORAGE_EVENT, handleUsernameChange);
  };
}

function setStoredUsername(username: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(USERNAME_STORAGE_KEY, username);
  notifyStoredUsernameChange();
}

function clearStoredUsername() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(USERNAME_STORAGE_KEY);
  notifyStoredUsernameChange();
}

export {
  clearStoredUsername,
  getStoredUsername,
  getStoredUsernameServerSnapshot,
  setStoredUsername,
  subscribeToStoredUsername,
};
