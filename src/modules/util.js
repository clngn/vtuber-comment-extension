export const storageKey = 'nameList';

export const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  });
};

export const setStorageData = (key, value) => {
  return new Promise(resolve => {
    chrome.storage.local.set(
      {
        [key]: value,
      },
      () => {
        resolve();
      },
    );
  });
};
