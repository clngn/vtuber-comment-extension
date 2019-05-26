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

const isMac = () => {
  return new Promise(resolve => {
    chrome.runtime.getPlatformInfo(info => resolve(info.os === 'mac'));
  });
};

const execNotification = async request => {
  const { liveTitle, authorName, message, iconUrl, ownerName, ownerIconUrl } = request;
  const option = {
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
  };
  if (await isMac()) {
    option.buttons.push({
      title: message,
    });
  }
  chrome.notifications.create(option, () => {});
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
