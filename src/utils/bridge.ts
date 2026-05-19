type BridgePayload = Record<string, unknown>

export const callBridge = (action: string, payload: BridgePayload = {}) => {
  window.dispatchEvent(
    new CustomEvent('app-bridge-call', {
      detail: {
        action,
        payload,
      },
    }),
  )
}
