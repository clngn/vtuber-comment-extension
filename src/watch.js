let nameList = [];
const storageKey = 'nameList';

const selectorList = {
  youtube: {
    chat: 'yt-live-chat-app',
    liveTitle: '#info .title',
  },
  youtubeGaming: {
    chat: 'yt-live-chat-renderer',
    liveTitle: '#details #title .ytg-formatted-string',
  },
};
const selector = window.location.host.match(/gaming/) ? selectorList.youtubeGaming : selectorList.youtube;

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

const checkComment = async node => {
  if (node.nodeName.toLowerCase() !== 'yt-live-chat-text-message-renderer') {
    return;
  }

  const authorName = node.querySelector('#author-name').textContent;
  if (nameList.some(value => value === authorName.trim())) {
    const liveTitle = parent.document.querySelector(selector.liveTitle).textContent;
    const message = node.querySelector('#message').textContent;
    const iconUrl = node.querySelector('#img').getAttribute('src');
    const iconLargeUrl = iconUrl.replace(/\/photo.jpg$/, '');

    chrome.runtime.sendMessage(
      {
        liveTitle,
        authorName,
        message,
        iconUrl: await fetchBlobUrl(iconLargeUrl),
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

  observer.observe(document.querySelector(selector.chat), {
    childList: true,
    subtree: true,
  });
};
init();
