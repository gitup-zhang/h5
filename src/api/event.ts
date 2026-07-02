import http from './http'
import type {
  EventListParams,
  EventItem,
  EventDetail,
  RegistrationStatus,
  PaginatedData,
} from '@/types/event'

// ─── 4.1 查询活动列表（无需登录）────────────────────────
export const getEventList = (params?: EventListParams) =>
  http.get<PaginatedData<EventItem>>('/events', params as Record<string, unknown>)

// ─── 4.2 获取活动详情（无需登录）────────────────────────
export const getEventDetail = (id: number) =>
  http.get<EventDetail>(`/events/${id}`)

// ─── 4.3 报名活动（需要登录）────────────────────────────
// data 的字段 key 由活动详情的 user_info[].code 动态决定
export const registerForEvent = (id: number, data?: Record<string, unknown>) =>
  http.post(`/events/${id}/registrations`, data)

// ─── 4.4 查询用户是否已报名（需要登录）─────────────────
export const getRegistrationStatus = (id: number) =>
  http.get<RegistrationStatus>(`/events/${id}/registrations/me`)

// ─── 4.5 取消活动报名（需要登录）────────────────────────
export const cancelRegistration = (id: number) =>
  http.delete(`/events/${id}/registrations/me`)

// ─── 4.6 获取用户已报名的活动列表（需要登录）───────────
export const getMyRegistrations = (params?: EventListParams) =>
  http.get<PaginatedData<EventItem>>('/events/me/registrations', params as Record<string, unknown>)
