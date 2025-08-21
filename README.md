# S.H.E.Y Salon & Spa Booking System

一个现代化的美容美发沙龙和水疗中心预约管理系统，基于 Next.js 15 和 Supabase 构建。

## 🌟 功能特性

### 用户功能
- **用户注册与登录** - 安全的身份验证系统
- **预约管理** - 查看、预订和管理个人预约
- **沙龙搜索** - 基于地理位置的沙龙和水疗中心搜索
- **个人仪表板** - 查看预约统计和历史记录
- **个人资料管理** - 更新个人信息

### 管理员功能
- **沙龙管理** - 添加、编辑和删除沙龙/水疗中心
- **预约管理** - 查看和管理所有预约
- **统计仪表板** - 查看业务统计数据
- **地理位置集成** - 高德地图 API 集成用于位置选择

### 技术特性
- **响应式设计** - 支持桌面和移动设备
- **实时数据** - 基于 Supabase 的实时数据同步
- **JWT 认证** - 安全的用户会话管理
- **TypeScript** - 完整的类型安全
- **现代 UI** - 基于 Radix UI 和 Tailwind CSS

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **数据库**: Supabase (PostgreSQL)
- **身份验证**: JWT + Cookies
- **UI 组件**: Radix UI
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **表单处理**: React Hook Form + Zod
- **地图服务**: 高德地图 API
- **日期处理**: Day.js
- **通知**: React Hot Toast

## 📋 系统要求

- Node.js 18.0 或更高版本
- npm, yarn, pnpm 或 bun 包管理器
- Supabase 账户
- 高德地图 API 密钥（可选，用于地理位置功能）

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd shey-salon-spa
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
# 或
bun install
```

### 3. 环境配置

创建 `.env.local` 文件并添加以下环境变量：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT 密钥
JWT_SECRET=your_jwt_secret_key

# 高德地图 API（可选）
NEXT_PUBLIC_AMAP_API_KEY=your_amap_api_key
```

### 4. 数据库设置

在 Supabase 中创建以下表结构：

```sql
-- 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 沙龙/水疗中心表
CREATE TABLE salon_spas (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  working_days TEXT[] DEFAULT '{}',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start_time TIME,
  break_end_time TIME,
  min_service_price DECIMAL(10,2) NOT NULL,
  max_service_price DECIMAL(10,2) NOT NULL,
  slot_duration INTEGER DEFAULT 60,
  max_bookings_per_slot INTEGER DEFAULT 1,
  location_name VARCHAR(255),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  offer_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 预约表
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  salon_spa_id INTEGER REFERENCES salon_spas(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'booked' CHECK (status IN ('booked', 'completed', 'canceled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
src/
├── actions/           # 服务器操作
│   ├── appointments.ts
│   ├── salon-spas.ts
│   └── users.ts
├── app/              # Next.js App Router
│   ├── (private)/    # 私有路由
│   │   ├── admin/    # 管理员页面
│   │   └── user/     # 用户页面
│   └── (public)/     # 公共路由
├── components/       # 可复用组件
│   └── ui/          # UI 组件库
├── config/          # 配置文件
├── constants/       # 常量定义
├── interfaces/      # TypeScript 接口
├── layout-provider/ # 布局组件
├── lib/            # 工具函数
└── store/          # 状态管理
```

## 🔐 用户角色

### 普通用户 (User)
- 浏览和搜索沙龙/水疗中心
- 预订服务
- 管理个人预约
- 查看预约历史

### 管理员 (Admin)
- 管理沙龙/水疗中心信息
- 查看所有预约
- 管理用户预约状态
- 查看业务统计数据

## 🗺️ 地图集成

项目集成了高德地图 API 用于：
- 沙龙位置选择
- 地理位置搜索
- 距离计算

详细配置请参考 `AMAP_SETUP.md` 文件。

## 🚀 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量
4. 部署

### 其他平台

项目支持部署到任何支持 Next.js 的平台：
- Netlify
- Railway
- AWS Amplify
- 自托管服务器

### 环境变量配置

确保在部署平台中设置以下环境变量：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `NEXT_PUBLIC_AMAP_API_KEY`（可选）

## 🧪 开发

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 📝 API 路由

项目使用 Next.js Server Actions 处理 API 请求：

- `/actions/users.ts` - 用户相关操作
- `/actions/salon-spas.ts` - 沙龙管理操作
- `/actions/appointments.ts` - 预约管理操作

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 支持

如有问题，请提交 Issue 或联系开发团队。
