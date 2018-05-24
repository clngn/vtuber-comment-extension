let nameList = [];
const storageKey = 'nameList';

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
  if (nameList.some(value => value === authorName)) {
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
  const storageData = await getStorageData(storageKey);
  nameList = storageData[storageKey];

  const observer = new MutationObserver((records, observer) => {
    records.forEach(record => {
      record.addedNodes.forEach(node => checkComment(node));
    });
  });
  observer.observe(
    document.querySelector('yt-live-chat-app'),
    {
      childList: true,
      subtree: true,
    }
  );
};
init();
