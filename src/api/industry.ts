import http from './http'
import type { IndustryItem } from '@/types/industry'

/** 3.1 查询行业列表（无需登录） */
export const getIndustries = (enable: number = 1) =>
  http.get<IndustryItem[]>('/industries', { enable })
