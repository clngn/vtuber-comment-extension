let nameList = [];
const storageKey = 'nameList';

const askPermission = () => {
  return new Promise(resolve => {
    Notification.requestPermission(result => {
      if (result === 'granted') resolve();
    });
  });
};

const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  })
};

const checkComment = node => {
  if (node.nodeName.toLowerCase() !== 'yt-live-chat-text-message-renderer') return;

  const authorName = node.querySelector('#author-name').textContent;
  if (nameList.some(value => value === authorName.trim())) {
    const message = node.querySelector('#message').textContent;
    const iconUrl = node.querySelector('#img').getAttribute('src')

    new Notification(
      authorName,
      {
        body: message,
        icon: iconUrl,
      }
    );
  }
};

const init = async () => {
  await askPermission();

  const storageData = await getStorageData(storageKey);
  nameList = storageData[storageKey];

  const observer = new MutationObserver((records, observer) => {
    records.forEach(record => {
      record.addedNodes.forEach(node => checkComment(node));
    });
  });

  const host = window.location.host;
  const chatSelector = host.match(/gaming/) ? 'yt-live-chat-renderer' : 'yt-live-chat-app';

  observer.observe(
    document.querySelector(chatSelector),
    {
      childList: true,
      subtree: true,
    }
  );
};
init();
