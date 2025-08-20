# 高德地图API配置与使用指南

## 概述

本项目使用高德地图API实现地理位置选择功能，采用混合架构：
- **地图显示**：高德地图 JS SDK v1.4.15
- **搜索功能**：高德地图 REST API v3
- **定位服务**：高德地图 REST API v3

## 快速开始

### 1. 获取API密钥

1. 访问 [高德地图开放平台](https://console.amap.com/dev/key/app)
2. 注册并登录账号
3. 创建新应用，选择 "Web端(JS API)"
4. 获取API密钥（Key）

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```env
NEXT_PUBLIC_AMAP_KEY=你的高德地图API密钥
```

**注意**：修改环境变量后需要重启开发服务器。

### 3. 高德地图开放平台配置

#### 应用设置
- **应用类型**：Web端(JS API)
- **服务平台**：Web端

#### 域名白名单配置
添加以下域名到白名单：
```
localhost:3000
localhost:3001
127.0.0.1:3000
127.0.0.1:3001
你的生产域名
```

#### 必需的API服务
确保以下服务已启用：
- ✅ **Web服务API** - 用于地图显示
- ✅ **Web服务API/地理编码** - 用于地址解析
- ✅ **Web服务API/逆地理编码** - 用于坐标转地址
- ✅ **Web服务API/搜索POI** - 用于地点搜索
- ✅ **Web服务API/IP定位** - 用于获取用户位置

## 功能特性

### 核心功能
- 🗺️ **地图显示**：基于高德地图JS SDK的交互式地图
- 🔍 **智能搜索**：实时地点搜索建议，支持全国范围
- 📍 **点击选点**：地图点击选择位置，自动获取地址信息
- 🌐 **IP定位**：自动根据用户IP获取大致位置
- 🔄 **逆地理编码**：坐标自动转换为可读地址
- ⌨️ **键盘导航**：支持方向键和回车键操作
- 🎯 **精确定位**：支持6位小数精度的坐标

### 用户体验
- 🚀 **防抖搜索**：300ms防抖，减少API调用
- 💡 **智能建议**：搜索结果按相关性排序
- 🎨 **现代UI**：美观的下拉建议列表
- ⚡ **快速响应**：优化的加载和渲染性能
- 🛡️ **错误处理**：友好的错误提示和降级方案

## 使用方法

### 基本用法

```tsx
import LocationSelection from '@/components/LocationSelection';

function MyComponent() {
  const handleLocationChange = (location) => {
    console.log('选中位置:', location);
    // location 包含：
    // {
    //   latitude: "39.915000",
    //   longitude: "116.404000",
    //   locationName: "北京市东城区天安门广场"
    // }
  };

  return (
    <LocationSelection
      onLocationChange={handleLocationChange}
    />
  );
}
```

### 带初始位置

```tsx
<LocationSelection
  initialLocation={{
    latitude: "39.915000",
    longitude: "116.404000",
    locationName: "天安门广场"
  }}
  onLocationChange={handleLocationChange}
/>
```

### 仅坐标（自动获取地址）

```tsx
<LocationSelection
  initialLocation={{
    latitude: "39.915000",
    longitude: "116.404000"
    // locationName 会通过逆地理编码自动获取
  }}
  onLocationChange={handleLocationChange}
/>
```

## API接口说明

### LocationSelectionProps

| 属性 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `initialLocation` | `Partial<SelectedLocation>` | 否 | 初始位置信息 |
| `onLocationChange` | `(location: SelectedLocation) => void` | 否 | 位置变化回调 |

### SelectedLocation

| 属性 | 类型 | 说明 |
|------|------|------|
| `latitude` | `string` | 纬度（6位小数精度） |
| `longitude` | `string` | 经度（6位小数精度） |
| `locationName` | `string?` | 地址名称 |

## 技术架构

### 混合架构设计

```
┌─────────────────┐    ┌──────────────────┐
│   地图显示      │    │    搜索功能      │
│  JS SDK v1.4.15│    │  REST API v3     │
│                 │    │                  │
│ • 地图渲染      │    │ • 地点搜索       │
│ • 交互操作      │    │ • 逆地理编码     │
│ • 标记显示      │    │ • IP定位         │
└─────────────────┘    └──────────────────┘
```

### 为什么使用混合架构？

1. **地图显示**使用JS SDK：
   - 提供完整的地图交互功能
   - 支持点击、缩放、拖拽等操作
   - 更好的用户体验

2. **搜索功能**使用REST API：
   - 更稳定的搜索服务
   - 更好的搜索结果质量
   - 减少JS SDK的依赖

## 故障排除

### 常见问题

#### 1. 地图无法显示

**可能原因**：
- API密钥未配置或无效
- 域名未添加到白名单
- Web服务API未启用

**解决方案**：
1. 检查 `.env.local` 中的 `NEXT_PUBLIC_AMAP_KEY`
2. 确认域名已添加到高德地图控制台白名单
3. 确认Web服务API已启用

#### 2. 搜索功能不工作

**可能原因**：
- 搜索POI服务未启用
- API调用次数超限
- 网络连接问题

**解决方案**：
1. 在高德地图控制台启用"搜索POI"服务
2. 检查API调用配额
3. 检查网络连接

#### 3. IP定位失败

**可能原因**：
- IP定位服务未启用
- 用户网络环境特殊

**解决方案**：
1. 启用"IP定位"服务
2. IP定位失败会自动降级到默认位置（北京）

### 调试技巧

1. **检查控制台**：查看浏览器开发者工具的控制台错误
2. **网络面板**：检查API请求是否成功
3. **测试API密钥**：使用简单的HTML页面测试

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://webapi.amap.com/maps?v=1.4.15&key=你的API密钥"></script>
</head>
<body>
    <div id="map" style="width:100%;height:400px;"></div>
    <script>
        var map = new AMap.Map('map', {
            center: [116.404, 39.915],
            zoom: 15
        });
    </script>
</body>
</html>
```

## 最佳实践

### 性能优化

1. **防抖搜索**：已实现300ms防抖，避免频繁API调用
2. **请求取消**：使用AbortController取消未完成的请求
3. **错误处理**：优雅处理API失败，不影响用户体验

### 安全考虑

1. **API密钥保护**：
   - 使用环境变量存储密钥
   - 配置域名白名单限制使用范围
   - 定期轮换API密钥

2. **用户隐私**：
   - IP定位失败时静默处理
   - 不强制要求位置权限

### 用户体验

1. **渐进增强**：
   - 地图加载失败时显示友好错误信息
   - 提供多种位置选择方式

2. **无障碍访问**：
   - 支持键盘导航
   - 提供清晰的视觉反馈

## 更新日志

### v1.0.0
- ✅ 实现基础地图显示功能
- ✅ 集成地点搜索和建议
- ✅ 支持点击选点和逆地理编码
- ✅ 添加IP定位功能
- ✅ 优化用户交互体验
- ✅ 完善错误处理机制

## 许可证与限制

### 高德地图使用条款
- 个人开发者免费使用
- 商业使用需要遵循高德地图服务条款
- 每日免费调用配额：具体查看控制台

### 推荐配额管理
- 监控API调用次数
- 合理设置缓存策略
- 避免不必要的重复请求

---

如有问题，请参考 [高德地图开放平台文档](https://lbs.amap.com/api/javascript-api/summary) 或提交Issue。