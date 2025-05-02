
function persistStorage () {
  // Request persistent storage
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(persistent => {
      if (persistent) {
        // eslint-disable-next-line no-console
        console.info('Storage will not be evicted under normal circumstances.')
      } else {
        // eslint-disable-next-line no-console
        console.info('Storage may be evicted under storage pressure.')
      }
    })
  }
}

export { persistStorage }
