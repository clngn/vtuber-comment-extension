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

document.querySelector('#save').addEventListener('click', async () => {
  const inputData = document.querySelector('#name-list textArea').value;
  await setStorageData(storageKey, inputData.split('\n'));
  document.querySelector('#result-dialog').showModal();
});

document.querySelector('#result-dialog .close').addEventListener('click', () => {
  document.querySelector('dialog').close();
});

const init = async () => {
  const storageData = await getStorageData(storageKey);
  const nameList = storageData[storageKey];

  const textArea = document.querySelector('#name-list textArea');
  textArea.value = nameList.join('\n');
};
init();
