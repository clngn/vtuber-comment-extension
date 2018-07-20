const storageKey = 'nameList';

const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  });
};

const setStorageData = (key, value) => {
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

const execNotification = request => {
  const { liveTitle, authorName, message, iconUrl, ownerName, ownerIconUrl } = request;
  chrome.notifications.create(
    {
      type: 'basic',
      title: authorName,
      message,
      contextMessage: liveTitle,
      iconUrl,
      buttons: [
        {
          title: ownerName,
          iconUrl: ownerIconUrl,
        }
      ],
    },
    () => {},
  );
};

chrome.runtime.onInstalled.addListener(async () => {
  const storageData = await getStorageData(storageKey);

  if (Object.keys(storageData).length === 0) {
    await setStorageData(storageKey, []);
  }
});

chrome.runtime.onMessage.addListener(message => {
  execNotification(message);
});
