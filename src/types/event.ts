// ─── 活动状态 ─────────────────────────────────────────

export type EventStatus = 'NotBegun' | 'InProgress' | 'Completed'

// ─── 领域信息 ─────────────────────────────────────────

export interface EventField {
  field_id: number
  field_code: string
  field_name: string
}

// ─── 活动图片 ─────────────────────────────────────────

export interface EventImage {
  image_id: number
  url: string
}

// ─── 报名所需用户信息字段 ────────────────────────────

export interface EventUserInfoField {
  id: number
  code: string
  name: string
}

// ─── 4.1 & 4.6 活动列表项 ─────────────────────────────

export interface EventItem {
  id: number
  title: string
  event_start_time: string
  event_end_time: string
  registration_start_time: string
  registration_end_time: string
  max_registrants: number
  current_registrants: number
  remaining_quota: number
  event_address: string
  status: string
  cover_image_url: string
  member_count: number
  need_invite_code: number
  invite_code?: string // 仅管理员可见
  fields: EventField[]
}

// ─── 4.2 活动详情 ────────────────────────────────────

export interface EventDetail extends EventItem {
  detail: string // 富文本 HTML
  images: EventImage[]
  user_info: EventUserInfoField[]
}

// ─── 4.1 列表查询参数 ────────────────────────────────

export interface EventListParams {
  page?: number
  page_size?: number
  event_status?: EventStatus
  query_scope?: 'ALL' | 'DELETED'
  event_title?: string
}

// ─── 分页数据结构 ─────────────────────────────────────

export interface PaginatedData<T> {
  total: number
  page: number
  pageSize: number
  list: T[]
}

// ─── 4.4 报名状态 ────────────────────────────────────

export interface RegistrationStatus {
  is_registered: 'Y' | 'N'
  message: string
}

// ─── 4.3 报名请求 ────────────────────────────────────

export interface RegisterEventParams {
  invite_code?: string
}
