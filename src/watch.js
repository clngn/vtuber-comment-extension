let nameList = []
const storageKey = 'nameList'

const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value)
    })
  })
}

const fetchBlobUrl = async url => {
  const response = await fetch(url)
  const blob = await response.blob()
  return window.URL.createObjectURL(blob)
}

const checkComment = async node => {
  if (node.nodeName.toLowerCase() !== 'yt-live-chat-text-message-renderer') return

  const authorName = node.querySelector('#author-name').textContent
  if (nameList.some(value => value === authorName.trim())) {
    const liveTitle = parent.document.querySelector('#info .title').textContent
    const message = node.querySelector('#message').textContent
    const iconUrl = node.querySelector('#img').getAttribute('src')
    const iconLargeUrl = iconUrl.replace(/\/photo.jpg$/, '')

    chrome.runtime.sendMessage({
      liveTitle,
      authorName,
      message,
      iconUrl: await fetchBlobUrl(iconLargeUrl)
    }, response => {})
  }
}

const init = async () => {
  const storageData = await getStorageData(storageKey)
  nameList = storageData[storageKey]

  const observer = new MutationObserver((records, observer) => {
    records.forEach(record => {
      record.addedNodes.forEach(node => checkComment(node))
    })
  })

  const host = window.location.host
  const chatSelector = host.match(/gaming/) ? 'yt-live-chat-renderer' : 'yt-live-chat-app'

  observer.observe(
    document.querySelector(chatSelector),
    {
      childList: true,
      subtree: true
    }
  )
}
init()
