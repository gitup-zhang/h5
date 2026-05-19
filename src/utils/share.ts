export interface ShareConfig {
  title: string
  desc: string
  link: string
  imgUrl: string
}

export const setupShare = (config: ShareConfig) => {
  window.dispatchEvent(
    new CustomEvent('h5-share-config', {
      detail: config,
    }),
  )
}
