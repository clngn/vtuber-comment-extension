let nameList = []
const storageKey = 'nameList'

const askPermission = () => {
  return new Promise(resolve => {
    Notification.requestPermission(result => {
      if (result === 'granted') resolve()
    })
  })
}

const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value)
    })
  })
}

const getConfig = host => {
  if (host.match(/gaming/)) {
    return {
      chatSelector: 'yt-live-chat-renderer',
      ownerSelector: '#owner'
    }
  } else {
    return {
      chatSelector: 'yt-live-chat-app',
      ownerSelector: '#owner-name.ytd-video-owner-renderer'
    }
  }
}

const checkComment = (node, ownerName) => {
  if (node.nodeName.toLowerCase() !== 'yt-live-chat-text-message-renderer') return

  const authorName = node.querySelector('#author-name').textContent
  if (nameList.some(value => value === authorName.trim())) {
    const message = node.querySelector('#message').textContent
    const iconUrl = node.querySelector('#img').getAttribute('src')
    const iconLargeUrl = iconUrl.replace(/\/photo.jpg/, "")
    const body = `${message}\n\nfrom ${ownerName}`

    new Notification(  // eslint-disable-line
      authorName,
      {
        body: body,
        icon: iconLargeUrl
      }
    )
  }
}

const init = async () => {
  await askPermission()

  const storageData = await getStorageData(storageKey)
  nameList = storageData[storageKey]

  const host = window.location.host
  const config = getConfig(host)

  const topWindow = window.top
  const ownerName = topWindow.document.querySelector(config.ownerSelector).textContent

  const observer = new MutationObserver((records, observer) => {
    records.forEach(record => {
      record.addedNodes.forEach(node => checkComment(node, ownerName))
    })
  })

  observer.observe(
    document.querySelector(config.chatSelector),
    {
      childList: true,
      subtree: true
    }
  )
}
init()
