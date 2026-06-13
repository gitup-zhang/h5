import type { PaginatedData } from '@/types/event'

// ─── 消息数据 ─────────────────────────────────────────

export interface MessageItem {
  id: number
  title: string
  content: string
  sender_id: number
  target_type: string
  target_id: number
  send_time: string
  is_read: number // 0=未读, 1=已读
  read_time: string
}

// ─── 未读数量 ─────────────────────────────────────────

export interface UnreadCountData {
  unread_count: number
}

// ─── 查询参数 ─────────────────────────────────────────

export interface MessageListParams {
  page?: number
  page_size?: number
}

// 复用 PaginatedData 作为消息列表响应类型
export type MessageListResponse = PaginatedData<MessageItem>
