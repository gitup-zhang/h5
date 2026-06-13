import http from './http'
import type { FieldItem } from '@/types/field'

/** 2.1 查询领域列表（无需登录） */
export const getFields = (enable: number = 1) =>
  http.get<FieldItem[]>('/fields', { enable })
