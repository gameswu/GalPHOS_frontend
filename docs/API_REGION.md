# GalPHOS 地区管理API接口文档

## 概述
GalPHOS地区管理API接口，提供省份和学校数据的查询、管理和变更功能。这些接口支持管理员进行地区数据维护、学生进行地区变更申请，以及前端组件获取地区数据。

> **类型定义**: 本文档中的所有数据类型基于统一类型系统定义，详见 [API类型定义参考](./API_TYPES_REFERENCE.md)

## 基础信息

### 认证方式
部分接口需要在Header中包含：
```
Authorization: Bearer <token>
Content-Type: application/json
```

### 微服务路由
本模块的API通过区域管理服务处理：
- **服务**: region-management-service
- **端口**: 3007
- **健康检查**: `/health`

### 统一响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

---

## 数据类型定义

### Province 接口
```typescript
interface Province {
  id: string;           // 省份唯一标识
  name: string;         // 省份名称
  schools: School[];    // 该省份下的学校列表
}
```

### School 接口
```typescript
interface School {
  id: string;           // 学校唯一标识
  name: string;         // 学校名称
  provinceId?: string;  // 所属省份ID（可选）
}
```

### RegionChangeRequest 接口
```typescript
interface RegionChangeRequest {
  id: string;           // 申请唯一标识
  studentId: string;    // 学生ID
  currentProvince: string;  // 当前省份
  currentSchool: string;    // 当前学校
  targetProvince: string;   // 目标省份
  targetSchool: string;     // 目标学校
  reason: string;       // 申请理由
  status: 'pending' | 'approved' | 'rejected';  // 申请状态
  createdAt: string;    // 申请时间
  reviewedAt?: string;  // 审核时间
  reviewReason?: string; // 审核理由
}
```

---

## API接口列表

## 1. 通用地区查询接口（无需认证）

### 1.1 获取省份和学校数据

**接口**: `GET /api/regions/provinces-schools`

**描述**: 获取所有省份及其下属学校的完整数据，主要用于前端组件的地区选择功能

**认证**: 无需认证（公开接口）

**请求头**:
```typescript
{
  "Content-Type": "application/json"
}
```

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "province_001",
      name: "北京市",
      schools: [
        {
          id: "school_001",
          name: "北京市第一中学",
          provinceId: "province_001"
        },
        {
          id: "school_002",
          name: "北京市第二中学", 
          provinceId: "province_001"
        },
        {
          id: "school_003",
          name: "清华大学附属中学",
          provinceId: "province_001"
        }
      ]
    },
    {
      id: "province_002",
      name: "上海市",
      schools: [
        {
          id: "school_004",
          name: "上海中学",
          provinceId: "province_002"
        },
        {
          id: "school_005",
          name: "华东师范大学第二附属中学",
          provinceId: "province_002"
        }
      ]
    }
  ],
  message: "获取成功"
}
```

**使用场景**:
- 用户注册时的地区选择
- 个人资料管理中的地区变更
- 赛区变更申请中的目标地区选择

---

### 1.2 获取省份列表

**接口**: `GET /api/regions/provinces`

**描述**: 获取所有省份列表（不包含学校信息），用于需要省份数据但不需要学校详情的场景

**认证**: 无需认证（公开接口）

**请求头**:
```typescript
{
  "Content-Type": "application/json"
}
```

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "province_001",
      name: "北京市",
      schools: []
    },
    {
      id: "province_002", 
      name: "上海市",
      schools: []
    },
    {
      id: "province_003",
      name: "广东省",
      schools: []
    }
  ],
  message: "获取成功"
}
```

**使用场景**:
- 快速加载省份选择器
- 地区统计分析
- 省份级别的数据过滤

---

### 1.3 获取指定省份的学校列表

**接口**: `GET /api/regions/schools`

**描述**: 根据省份ID获取该省份下的所有学校列表

**认证**: 无需认证（公开接口）

**查询参数**:
- `provinceId` (string, 必填): 省份ID

**请求示例**:
```
GET /api/regions/schools?provinceId=province_001
```

**请求头**:
```typescript
{
  "Content-Type": "application/json"
}
```

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "school_001",
      name: "北京市第一中学",
      provinceId: "province_001"
    },
    {
      id: "school_002",
      name: "北京市第二中学",
      provinceId: "province_001"
    },
    {
      id: "school_003",
      name: "清华大学附属中学",
      provinceId: "province_001"
    }
  ],
  message: "获取成功"
}
```

**使用场景**:
- 省份选择后动态加载学校列表
- 按需加载学校数据以提升性能
- 级联选择器的第二级数据加载

---

## 2. 管理员地区管理接口（需要管理员权限）

### 2.1 获取所有地区信息

**接口**: `GET /api/admin/regions`

**描述**: 获取系统中所有地区的信息，包括省份和学校数据

**认证**: 需要管理员权限

**请求头**:
```typescript
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

**响应**:
```typescript
{
  success: true,
  data: [
    // 地区数据结构类似provinces-schools，但可能包含更多管理信息
  ],
  message: "获取成功"
}
```

### 2.2 获取所有省份（管理员视图）

**接口**: `GET /api/admin/regions/provinces`

**描述**: 获取所有省份列表，包含管理员相关的统计信息

**认证**: 需要管理员权限

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "province_001",
      name: "北京市",
      schoolCount: 10,
      studentCount: 1520,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-06-30T12:00:00Z"
    }
  ],
  message: "获取成功"
}
```

### 2.3 添加省份

**接口**: `POST /api/admin/regions/provinces`

**描述**: 添加新的省份

**认证**: 需要管理员权限

**请求体**:
```typescript
{
  "name": "新省份名称"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "province_new",
    name: "新省份名称",
    schools: [],
    createdAt: "2024-06-30T12:00:00Z"
  },
  message: "省份添加成功"
}
```

### 2.4 删除省份

**接口**: `DELETE /api/admin/regions/provinces/{provinceId}`

**描述**: 删除指定的省份（仅在该省份下无学校时允许删除）

**认证**: 需要管理员权限

**路径参数**:
- `provinceId` (string, 必填): 省份ID

**响应**:
```typescript
{
  success: true,
  message: "省份删除成功"
}
```

### 2.5 获取省份下的学校列表（管理员视图）

**接口**: `GET /api/admin/regions/schools?provinceId={provinceId}`

**描述**: 获取指定省份下的学校列表，包含管理统计信息

**认证**: 需要管理员权限

**查询参数**:
- `provinceId` (string, 必填): 省份ID

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "school_001",
      name: "北京市第一中学",
      provinceId: "province_001",
      studentCount: 156,
      coachCount: 3,
      createdAt: "2024-01-01T00:00:00Z"
    }
  ],
  message: "获取成功"
}
```

### 2.6 添加学校

**接口**: `POST /api/admin/regions/schools`

**描述**: 在指定省份下添加新学校

**认证**: 需要管理员权限

**请求体**:
```typescript
{
  "provinceId": "province_001",
  "name": "新学校名称"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "school_new",
    name: "新学校名称",
    provinceId: "province_001",
    createdAt: "2024-06-30T12:00:00Z"
  },
  message: "学校添加成功"
}
```

### 2.7 更新学校信息

**接口**: `PUT /api/admin/regions/schools/{schoolId}`

**描述**: 更新指定学校的信息

**认证**: 需要管理员权限

**路径参数**:
- `schoolId` (string, 必填): 学校ID

**请求体**:
```typescript
{
  "name": "更新后的学校名称"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "school_001",
    name: "更新后的学校名称",
    provinceId: "province_001",
    updatedAt: "2024-06-30T12:00:00Z"
  },
  message: "学校信息更新成功"
}
```

### 2.8 删除学校

**接口**: `DELETE /api/admin/regions/schools/{schoolId}`

**描述**: 删除指定的学校（仅在该学校下无学生时允许删除）

**认证**: 需要管理员权限

**路径参数**:
- `schoolId` (string, 必填): 学校ID

**响应**:
```typescript
{
  success: true,
  message: "学校删除成功"
}
```

### 2.9 获取地区变更申请列表

**接口**: `GET /api/admin/regions/change-requests`

**描述**: 获取学生提交的地区变更申请列表

**认证**: 需要管理员权限

**查询参数**:
- `status` (string, 可选): 申请状态筛选 (`pending` | `approved` | `rejected`)
- `page` (number, 可选): 页码，默认1
- `limit` (number, 可选): 每页数量，默认10

**请求示例**:
```
GET /api/admin/regions/change-requests?status=pending&page=1&limit=10
```

**响应**:
```typescript
{
  success: true,
  data: {
    requests: [
      {
        id: "req_001",
        studentId: "student_001",
        studentName: "张三",
        currentProvince: "北京市",
        currentSchool: "北京市第一中学",
        targetProvince: "上海市",
        targetSchool: "上海中学",
        reason: "家庭搬迁",
        status: "pending",
        createdAt: "2024-06-30T10:00:00Z"
      }
    ],
    total: 25,
    page: 1,
    limit: 10
  },
  message: "获取成功"
}
```

### 2.10 处理地区变更申请

**接口**: `POST /api/admin/regions/change-requests/{requestId}`

**描述**: 审核学生的地区变更申请

**认证**: 需要管理员权限

**路径参数**:
- `requestId` (string, 必填): 申请ID

**请求体**:
```typescript
{
  "action": "approve" | "reject",  // 审核操作
  "reason"?: "审核理由（可选）"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "req_001",
    status: "approved",
    reviewedAt: "2024-06-30T12:00:00Z",
    reviewReason: "符合变更条件"
  },
  message: "申请处理成功"
}
```

---

## 3. 学生地区变更接口（需要学生权限）

### 3.1 申请地区变更

**接口**: `POST /api/student/region-change`

**描述**: 学生提交地区变更申请

**认证**: 需要学生权限

**请求头**:
```typescript
{
  "Authorization": "Bearer <student_token>",
  "Content-Type": "application/json"
}
```

**请求体**:
```typescript
{
  "province": "目标省份ID",
  "school": "目标学校ID", 
  "reason": "变更理由"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "req_new",
    studentId: "student_001",
    currentProvince: "北京市",
    currentSchool: "北京市第一中学",
    targetProvince: "上海市",
    targetSchool: "上海中学",
    reason: "家庭搬迁",
    status: "pending",
    createdAt: "2024-06-30T12:00:00Z"
  },
  message: "地区变更申请提交成功"
}
```

### 3.2 查看地区变更申请状态

**接口**: `GET /api/student/region-change/status`

**描述**: 学生查看自己的地区变更申请历史和状态

**认证**: 需要学生权限

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "req_001",
      currentProvince: "北京市",
      currentSchool: "北京市第一中学",
      targetProvince: "上海市",
      targetSchool: "上海中学",
      reason: "家庭搬迁",
      status: "pending",
      createdAt: "2024-06-30T10:00:00Z",
      reviewedAt: null,
      reviewReason: null
    }
  ],
  message: "获取成功"
}
```

**使用场景**:
- 学生查看申请进度
- 学生查看历史申请记录
- 前端显示申请状态

---

## 4. 教练地区变更接口（需要教练权限）

### 4.1 申请地区变更

**接口**: `POST /api/coach/region-change`

**描述**: 教练提交地区变更申请

**认证**: 需要教练权限

**请求头**:
```typescript
{
  "Authorization": "Bearer <coach_token>",
  "Content-Type": "application/json"
}
```

**请求体**:
```typescript
{
  "province": "目标省份ID",
  "school": "目标学校ID", 
  "reason": "变更理由"
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: "req_coach_001",
    coachId: "coach_001",
    currentProvince: "北京市",
    currentSchool: "北京市第一中学",
    targetProvince: "上海市",
    targetSchool: "上海中学",
    reason: "工作调动",
    status: "pending",
    createdAt: "2024-06-30T12:00:00Z"
  },
  message: "地区变更申请提交成功"
}
```

### 4.2 查看地区变更申请状态

**接口**: `GET /api/coach/region-change/status`

**描述**: 教练查看自己的地区变更申请历史和状态

**认证**: 需要教练权限

**响应**:
```typescript
{
  success: true,
  data: [
    {
      id: "req_coach_001",
      currentProvince: "北京市",
      currentSchool: "北京市第一中学",
      targetProvince: "上海市",
      targetSchool: "上海中学",
      reason: "工作调动",
      status: "pending",
      createdAt: "2024-06-30T10:00:00Z",
      reviewedAt: null,
      reviewReason: null
    }
  ],
  message: "获取成功"
}
```

**使用场景**:
- 教练查看申请进度
- 教练查看历史申请记录
- 前端显示申请状态

---

## 错误处理

### 统一错误响应格式
```typescript
{
  success: false,
  message: "错误描述信息",
  error?: {
    code: "ERROR_CODE",
    details: "详细错误信息"
  }
}
```

### 常见HTTP状态码
| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 400 | Bad Request | 请求参数错误（如缺少provinceId） |
| 404 | Not Found | 请求的资源不存在（如省份ID不存在） |
| 500 | Internal Server Error | 服务器内部错误 |

### 常见错误示例

#### 参数错误
```typescript
// 缺少必要参数
{
  success: false,
  message: "缺少必要参数：provinceId",
  error: {
    code: "MISSING_PARAMETER",
    details: "provinceId is required"
  }
}
```

#### 资源不存在
```typescript
// 省份不存在
{
  success: false,
  message: "指定的省份不存在",
  error: {
    code: "PROVINCE_NOT_FOUND",
    details: "Province with id 'invalid_id' not found"
  }
}
```

#### 服务错误
```typescript
// 服务器内部错误
{
  success: false,
  message: "服务器内部错误，请稍后重试",
  error: {
    code: "INTERNAL_SERVER_ERROR",
    details: "Database connection failed"
  }
}
```

---

## 前端集成说明

### 1. API调用示例

```typescript
import RegionAPI from '../api/region';

// 获取所有省份和学校数据
const loadRegionData = async () => {
  try {
    const response = await RegionAPI.getProvincesAndSchools();
    if (response.success && response.data) {
      setProvinces(response.data);
    } else {
      message.error(response.message || '获取地区数据失败');
    }
  } catch (error) {
    console.error('加载地区数据失败:', error);
    message.error('网络错误，请检查连接');
  }
};

// 根据省份获取学校列表
const loadSchoolsByProvince = async (provinceId: string) => {
  try {
    const response = await RegionAPI.getSchoolsByProvince(provinceId);
    if (response.success && response.data) {
      setSchools(response.data);
    } else {
      message.error(response.message || '获取学校列表失败');
    }
  } catch (error) {
    console.error('加载学校数据失败:', error);
    message.error('获取学校列表失败');
  }
};
```

### 2. 级联选择器实现

```typescript
import { Select } from 'antd';
const { Option } = Select;

const RegionSelector: React.FC = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);

  // 初始化加载省份数据
  useEffect(() => {
    loadRegionData();
  }, []);

  // 省份选择变化处理
  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    const province = provinces.find(p => p.id === provinceId);
    if (province) {
      setAvailableSchools(province.schools);
    }
  };

  return (
    <div>
      <Select
        placeholder="请选择省份"
        value={selectedProvince}
        onChange={handleProvinceChange}
        style={{ width: 200, marginRight: 16 }}
      >
        {provinces.map(province => (
          <Option key={province.id} value={province.id}>
            {province.name}
          </Option>
        ))}
      </Select>
      
      <Select
        placeholder="请选择学校"
        disabled={!selectedProvince}
        style={{ width: 300 }}
      >
        {availableSchools.map(school => (
          <Option key={school.id} value={school.id}>
            {school.name}
          </Option>
        ))}
      </Select>
    </div>
  );
};
```

### 3. 错误处理最佳实践

```typescript
const handleApiCall = async (apiFunction: () => Promise<any>) => {
  try {
    const result = await apiFunction();
    if (result.success) {
      return result.data;
    } else {
      // 显示用户友好的错误信息
      message.error(result.message || '操作失败');
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('API调用失败:', error);
    message.error('网络错误，请稍后重试');
    throw error;
  }
};
```

### 4. 缓存优化建议

```typescript
// 使用React Query进行数据缓存
import { useQuery } from 'react-query';

const useProvinces = () => {
  return useQuery(
    'provinces-schools',
    () => RegionAPI.getProvincesAndSchools(),
    {
      staleTime: 5 * 60 * 1000, // 5分钟内数据视为新鲜
      cacheTime: 10 * 60 * 1000, // 缓存10分钟
      refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    }
  );
};
```

---

## 微服务路由配置

本模块的API路径在微服务路由器中的配置：

```typescript
// 区域管理服务 (Region Management Service)
regionManagement: {
  name: 'region-management-service',
  baseUrl: process.env.REACT_APP_REGION_MANAGEMENT_SERVICE_URL || 'http://localhost:3007',
  port: 3007,
  paths: [
    // 管理员区域管理
    '/api/admin/regions*',
    // 通用区域数据查询  
    '/api/regions/provinces-schools*',
    '/api/regions/provinces*',
    '/api/regions/schools*'
  ],
  description: '省份学校等地理信息管理服务',
  healthCheck: '/health'
}
```

---

## 注意事项

### 1. 数据一致性
- 省份和学校数据应与后端管理员配置保持一致
- 建议定期同步最新的地区数据
- 前端应处理数据加载失败的情况

### 2. 性能优化
- 地区数据通常变化不频繁，可以适当缓存
- 考虑使用懒加载，按需获取学校数据
- 对于大量学校的省份，可以考虑分页或搜索功能

### 3. 用户体验
- 提供友好的加载状态提示
- 网络错误时给出重试选项
- 支持搜索功能以快速定位地区

### 4. 扩展性
- API设计支持未来添加更多地区层级（如城市、区县）
- 支持地区信息的国际化需求
- 预留自定义字段以支持特殊业务需求

---

## 更新日志

### v1.2.0 (2025-06-30)
- **重要修复**: 统一教练与学生的地区变更API规范
- 教练地区变更API路径统一为 `/api/coach/region-change*`（与学生保持一致）
- 移除重复的API方法，统一方法命名规范
- 新增教练地区变更接口文档（2个API）
- 微服务路由配置增加教练地区变更API路径
- 优化智能路由推断逻辑，确保地区变更请求正确路由到区域管理服务
- API总数更新：17个地区相关API

### v1.1.0 (2025-06-30)
- 完善地区管理API模块文档
- 新增管理员地区管理接口（10个API）
- 新增学生地区变更申请接口（2个API）
- 微服务路由配置更新，确保API路径正确分配
- 完善数据类型定义，新增RegionChangeRequest接口
- 优化API文档结构，按角色和功能分类
- 增强错误处理说明和前端集成示例

### v1.0.0 (2025-06-30)
- 新增地区管理API模块
- 实现省份和学校数据查询功能
- 支持级联选择和按需加载
- 完善错误处理和文档说明
