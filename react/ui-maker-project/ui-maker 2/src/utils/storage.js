const PAGE_KEY_PREFIX = 'ui-maker:page:';
const PAGES_INDEX_KEY = 'ui-maker:pages-index';

export function getStorageKey(pageId) {
  return PAGE_KEY_PREFIX + pageId;
}

export function loadPageFromStorage(pageId) {
  const key = getStorageKey(pageId);
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
}

export function savePageToStorage(page) {
  if (!page || !page.id) return;
  const key = getStorageKey(page.id);
  window.localStorage.setItem(key, JSON.stringify(page));
  const index = getPagesIndex();
  if (!index.includes(page.id)) {
    index.push(page.id);
    window.localStorage.setItem(PAGES_INDEX_KEY, JSON.stringify(index));
  }
}

export function getPagesIndex() {
  const raw = window.localStorage.getItem(PAGES_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (_e) {
    return [];
  }
}

export function deletePageFromStorage(pageId) {
  window.localStorage.removeItem(getStorageKey(pageId));
  const index = getPagesIndex().filter((id) => id !== pageId);
  window.localStorage.setItem(PAGES_INDEX_KEY, JSON.stringify(index));
}

export function clearAllStorage() {
  const index = getPagesIndex();
  index.forEach((id) => window.localStorage.removeItem(getStorageKey(id)));
  window.localStorage.removeItem(PAGES_INDEX_KEY);
}
