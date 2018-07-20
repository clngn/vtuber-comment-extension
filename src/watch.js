let nameList = [];
const storageKey = 'nameList';

const selectorList = {
  youtube: {
    chat: 'yt-live-chat-app',
    liveTitle: '#info .title',
    ownerName: '#meta #owner-name .yt-simple-endpoint',
    ownerIcon: '#meta #img',
  },
  youtubeGaming: {
    chat: 'yt-live-chat-renderer',
    liveTitle: '#details #title .ytg-formatted-string',
    ownerName: '#owner > span',
    ownerIcon: '#details #image',
  },
};

class YoutubeAccessor {
  constructor(selectorList) {
    this.selectorList = selectorList;
  }

  getChat(){
    return document.querySelector(this.selectorList.chat);
  }

  getLiveTitle() {
    return parent.document.querySelector(this.selectorList.liveTitle).textContent;
  }

  getOwnerName() {
    return parent.document.querySelector(this.selectorList.ownerName).textContent;
  }

  getOwnerIcon() {
    return parent.document.querySelector(this.selectorList.ownerIcon).getAttribute('src');
  }
}

class YoutubeGamingAccessor extends YoutubeAccessor {
  constructor(selectorList) {
    super(selectorList);
  }

  getOwnerIcon(){
    return parent.document.querySelector(this.selectorList.ownerIcon).style.backgroundImage.replace(/url\(("|')(.+)("|')\)/gi, '$2');
  }
}

const accessor = window.location.host.match(/gaming/) ? new YoutubeGamingAccessor(selectorList.youtubeGaming) : new YoutubeAccessor(selectorList.youtube);

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
    const liveTitle = accessor.getLiveTitle();
    const message = node.querySelector('#message').textContent;
    const iconUrl = node.querySelector('#img').getAttribute('src');
    const iconLargeUrl = iconUrl.replace(/\/photo.jpg$/, '');
    const ownerName = accessor.getOwnerName();
    const ownerIconUrl = accessor.getOwnerIcon();

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

  observer.observe(accessor.getChat(), {
    childList: true,
    subtree: true,
  });
};
init();
