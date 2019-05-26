import { storageKey, getStorageData, setStorageData } from './modules/util';

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
        },
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
