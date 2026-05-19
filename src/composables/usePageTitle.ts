import { onMounted, watch, type Ref } from 'vue'

export const usePageTitle = (title: Ref<string> | string) => {
  const setTitle = (value: string) => {
    document.title = value
  }

  onMounted(() => {
    if (typeof title === 'string') {
      setTitle(title)
      return
    }

    setTitle(title.value)
  })

  if (typeof title !== 'string') {
    watch(title, setTitle)
  }
}
