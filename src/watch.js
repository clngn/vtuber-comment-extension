let nameList = [];
const storageKey = 'nameList';

const selector = {
  getChatDom: () => document.querySelector('yt-live-chat-app'),
  getLiveTitle: () => parent.document.querySelector('#info .title').textContent,
  getOwnerName: () => parent.document.querySelector('#meta #channel-name .yt-simple-endpoint').textContent,
  getOwnerIconUrl: () => parent.document.querySelector('#meta #img').getAttribute('src'),
};

const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  });
};

const fetchBlobUrl = async url => {
  const response = await fetch(url);
  const blob = await response.blob();
  return window.URL.createObjectURL(blob);
};

const getMessage = el => {
  let messageString = '';

  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      messageString += child.wholeText;
    }
    if (child.nodeType === Node.ELEMENT_NODE) {
      if (child.nodeName.toLowerCase() === 'img' && typeof child.alt === 'string') {
        messageString += child.alt;
      }
    }
  }

  return messageString;
};

const checkComment = async node => {
  if (
    node.nodeName.toLowerCase() !== 'yt-live-chat-text-message-renderer' &&
    node.nodeName.toLowerCase() !== 'yt-live-chat-paid-message-renderer'
  ) {
    return;
  }

  const authorName = node.querySelector('#author-name').textContent.trim();
  if (!authorName) {
    return;
  }
  if (nameList.some(value => value === authorName)) {
    const liveTitle = selector.getLiveTitle();
    const message = getMessage(node.querySelector('#message'));
    const iconUrl = node.querySelector('#img').getAttribute('src');
    const iconLargeUrl = iconUrl.replace(/\/photo.jpg$/, '');
    const ownerName = selector.getOwnerName();
    const ownerIconUrl = selector.getOwnerIconUrl();

    chrome.runtime.sendMessage(
      {
        liveTitle,
        authorName,
        message,
        iconUrl: await fetchBlobUrl(iconLargeUrl),
        ownerName,
        ownerIconUrl: await fetchBlobUrl(ownerIconUrl),
      },
      () => {},
    );
  }
};

const init = async () => {
  const storageData = await getStorageData(storageKey);
  nameList = storageData[storageKey];

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => checkComment(node));
    });
  });

  observer.observe(selector.getChatDom(), {
    childList: true,
    subtree: true,
  });
};
init();
