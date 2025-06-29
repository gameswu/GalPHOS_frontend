// 地区数据相关API接口
// 本文件包含通用地区查询接口，用于前端组件获取省份和学校数据
// 完整的地区管理API文档请参考：docs/API_REGION.md
// 
// 注意：本文件仅包含公开的地区查询接口，不需要认证
// 管理员地区管理功能请使用 admin.ts 中的相关接口
// 学生地区变更功能请使用 student.ts 中的相关接口
//
// 微服务路由：所有 /api/regions/* 路径的请求都会路由到区域管理服务 (port 3007)

import { ApiResponse, BaseAPI } from '../types/api';

export interface Province {
  id: string;
  name: string;
  schools: School[];
}

export interface School {
  id: string;
  name: string;
  provinceId?: string;
}

class RegionAPI extends BaseAPI {
  // 获取所有省份和学校数据
  static async getProvincesAndSchools(): Promise<ApiResponse<Province[]>> {
    try {
      return await this.makeRequest<Province[]>(
        `/api/regions/provinces-schools`,
        {
          method: 'GET',
        },
        '获取省份和学校数据'
      );
    } catch (error) {
      return this.handleApiError(error, '获取省份和学校数据');
    }
  }

  // 获取省份列表
  static async getProvinces(): Promise<ApiResponse<Province[]>> {
    try {
      return await this.makeRequest<Province[]>(
        `/api/regions/provinces`,
        {
          method: 'GET',
        },
        '获取省份列表'
      );
    } catch (error) {
      return this.handleApiError(error, '获取省份列表');
    }
  }

  // 获取指定省份的学校列表
  static async getSchoolsByProvince(provinceId: string): Promise<ApiResponse<School[]>> {
    try {
      this.validateRequired(provinceId, '省份ID');
      
      const queryParams = this.buildQueryParams({ provinceId });
      return await this.makeRequest<School[]>(
        `/api/regions/schools${queryParams}`,
        {
          method: 'GET',
        },
        '获取学校列表'
      );
    } catch (error) {
      return this.handleApiError(error, '获取学校列表');
    }
  }
}

export default RegionAPI;
