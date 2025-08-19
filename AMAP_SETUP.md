# 高德地图API配置说明

## 问题解决

如果遇到地图加载失败错误，请按以下步骤检查：

### 1. 检查API密钥
当前配置的API密钥：`93e0af472c2fd4b3edd446c70d2b14fc`

### 2. 高德地图开放平台配置
访问：https://console.amap.com/dev/key/app

#### 必须配置的项目：
1. **应用类型**：选择 "Web端(JS API)"
2. **域名白名单**：添加以下域名
   - `localhost:3000`
   - `localhost:3001`
   - `127.0.0.1:3000`
   - `127.0.0.1:3001`
   - 你的生产域名

#### 启用的服务：
- ✅ Web服务API
- ✅ 地点搜索服务
- ✅ 逆地理编码服务

### 3. 常见问题解决

#### 问题1：域名白名单
确保在高德地图开放平台的应用管理中，将开发和生产域名都添加到白名单。

#### 问题2：API服务未开启
在控制台中确认以下服务已开启：
- Web服务API
- 地点搜索服务

#### 问题3：配额限制
检查API调用次数是否超出限制。

### 4. 测试API密钥
可以使用以下简单的HTML页面测试API密钥是否有效：

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://webapi.amap.com/maps?v=2.0&key=你的API密钥"></script>
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

### 5. 环境变量配置
确保 `.env` 文件中的配置正确：
```
NEXT_PUBLIC_AMAP_KEY=你的API密钥
```

注意：修改环境变量后需要重启开发服务器。

## 高德地图优势

相比百度地图，高德地图具有以下优势：

### 商用政策友好
- ✅ 个人开发者免费使用
- ✅ 无商用授权提示
- ✅ 更宽松的使用条款

### 技术优势
- ✅ API更加稳定
- ✅ 文档更加完善
- ✅ 社区支持更好

## 功能特性

高德地图组件支持：
- ✅ 地图点击选点
- ✅ 地点搜索建议
- ✅ 逆地理编码
- ✅ IP定位
- ✅ 错误处理和用户友好的错误提示
- ✅ 无商用授权限制
- ✅ 更好的地图样式和性能

## 使用方式

```tsx
<LocationSelection
  initialLocation={{
    latitude: "39.915",
    longitude: "116.404",
    locationName: "北京市"
  }}
  onLocationChange={(location) => {
    console.log("选中位置:", location);
  }}
/>
```

## 迁移说明

从百度地图迁移到高德地图的主要变化：

### API变化
- 环境变量：`NEXT_PUBLIC_BAIDU_MAP_AK` → `NEXT_PUBLIC_AMAP_KEY`
- 全局对象：`window.BMap` → `window.AMap`
- 坐标系统：保持一致（WGS84/GCJ02）

### 优势
- 无商用授权提示
- 更稳定的API服务
- 更好的开发者体验
- 免费使用额度更高