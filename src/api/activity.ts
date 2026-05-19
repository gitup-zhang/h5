import { http, type ApiResponse } from './http'

export interface ActivityInfo {
  id: string
  title: string
  startTime: string
  endTime: string
}

export const getActivityInfo = (id: string) => {
  return http.get<ApiResponse<ActivityInfo>>(`/activities/${id}`)
}
