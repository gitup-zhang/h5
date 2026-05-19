export type TrackingPayload = Record<string, string | number | boolean | null | undefined>

export const trackEvent = (eventName: string, payload: TrackingPayload = {}) => {
  if (import.meta.env.DEV) {
    console.info('[tracking]', eventName, payload)
  }
}
