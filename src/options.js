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

// Save Settings
document.querySelector('#save-button').addEventListener('click', async () => {
  const inputData = document.querySelector('#name-list textArea').value;
  await setStorageData(storageKey, inputData.split('\n'));
  document.querySelector('#result-dialog').showModal();
});

// Close Dialog
document.querySelector('#result-dialog .close').addEventListener('click', () => {
  document.querySelector('dialog').close();
});

// Notification Test
document.querySelector('#notification-test-button').addEventListener('click', () => {
  chrome.runtime.sendMessage(
    {
      liveTitle: '通知テスト',
      authorName: 'みんなよう見とる',
      message: 'テストだよ',
      iconUrl: chrome.runtime.getURL('images/icon128.png'),
      ownerName: 'テスト',
      ownerIconUrl: chrome.runtime.getURL('images/icon128.png'),
    },
    () => {},
  );
});

const init = async () => {
  const storageData = await getStorageData(storageKey);
  const nameList = storageData[storageKey];

  const textArea = document.querySelector('#name-list textArea');
  textArea.value = nameList.join('\n');
};
init();
