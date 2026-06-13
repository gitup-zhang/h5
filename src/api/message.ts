import http from './http'
import type { MessageListParams, MessageListResponse, UnreadCountData } from '@/types/message'

/** 查询当前用户消息列表（查询后自动全部标记已读） */
export const getMessages = (params?: MessageListParams) =>
  http.get<MessageListResponse>('/messages/me', params as Record<string, unknown>)

/** 获取用户未读消息数量 */
export const getUnreadCount = () =>
  http.get<UnreadCountData>('/messages/me/unread-count')
