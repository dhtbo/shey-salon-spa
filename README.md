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
- **系统设置** - 完整的系统配置管理
  - 个人信息管理和密码修改
  - 系统基础设置（网站名称、时区、语言等）
  - 通知设置（邮件、短信通知开关）
  - 安全设置（双因素认证、登录日志查看）
  - 数据备份管理（自动/手动备份、备份历史）
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

#### 4.1 创建数据库表

在 Supabase SQL 编辑器中执行以下 SQL 语句：

```sql
-- 1. 用户表 (user_profiles)
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- 2. 沙龙/SPA表 (salon_spas)
CREATE TABLE salon_spas (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    working_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    start_time TIME DEFAULT '09:00:00',
    end_time TIME DEFAULT '18:00:00',
    break_start_time TIME DEFAULT '12:00:00',
    break_end_time TIME DEFAULT '13:00:00',
    min_service_price DECIMAL(10,2) DEFAULT 0,
    max_service_price DECIMAL(10,2) DEFAULT 1000,
    slot_duration INTEGER DEFAULT 60, -- 分钟
    max_bookings_per_slot INTEGER DEFAULT 1,
    location_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    offer_status VARCHAR(20) DEFAULT 'active' CHECK (offer_status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_salon_spas_owner_id ON salon_spas(owner_id);
CREATE INDEX idx_salon_spas_city ON salon_spas(city);
CREATE INDEX idx_salon_spas_offer_status ON salon_spas(offer_status);

-- 3. 预约表 (appointments)
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
    salon_spa_id BIGINT REFERENCES salon_spas(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(20) DEFAULT '已预约' CHECK (status IN ('已预约', '已完成', '已取消')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_salon_spa_id ON appointments(salon_spa_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- 创建唯一约束，防止同一时间段重复预约
CREATE UNIQUE INDEX idx_appointments_unique_slot ON appointments(salon_spa_id, date, time) WHERE status != '已取消';

-- 4. 系统设置表 (system_settings)
CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT '美容预约系统',
    site_description TEXT DEFAULT '专业的美容沙龙预约管理平台',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    language VARCHAR(10) DEFAULT 'zh-CN',
    maintenance_mode BOOLEAN DEFAULT false,
    allow_registration BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    auto_backup BOOLEAN DEFAULT true,
    backup_frequency VARCHAR(20) DEFAULT 'daily' CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认设置
INSERT INTO system_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 5. 备份日志表 (backup_logs)
CREATE TABLE backup_logs (
    id BIGSERIAL PRIMARY KEY,
    backup_name VARCHAR(255) NOT NULL,
    backup_size BIGINT DEFAULT 0, -- 字节
    backup_type VARCHAR(20) DEFAULT 'manual' CHECK (backup_type IN ('manual', 'auto')),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_status ON backup_logs(status);

-- 6. 登录日志表 (login_logs)
CREATE TABLE login_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true
);

-- 创建索引
CREATE INDEX idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX idx_login_logs_login_time ON login_logs(login_time);
CREATE INDEX idx_login_logs_ip_address ON login_logs(ip_address);
```

#### 4.2 创建触发器和函数

```sql
-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加触发器
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salon_spas_updated_at 
    BEFORE UPDATE ON salon_spas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 4.3 配置 Row Level Security (RLS)

```sql
-- 1. 用户表策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的信息
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id::text);

-- 用户只能更新自己的信息
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 管理员可以查看所有用户
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- 2. 沙龙/SPA表策略
ALTER TABLE salon_spas ENABLE ROW LEVEL SECURITY;

-- 所有人都可以查看活跃的沙龙
CREATE POLICY "Anyone can view active salons" ON salon_spas
    FOR SELECT USING (offer_status = 'active');

-- 拥有者可以管理自己的沙龙
CREATE POLICY "Owners can manage own salons" ON salon_spas
    FOR ALL USING (owner_id::text = auth.uid()::text);

-- 管理员可以查看所有沙龙
CREATE POLICY "Admins can view all salons" ON salon_spas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- 3. 预约表策略
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的预约
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (user_id::text = auth.uid()::text);

-- 用户可以创建预约
CREATE POLICY "Users can create appointments" ON appointments
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- 用户可以更新自己的预约
CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- 沙龙拥有者可以查看自己沙龙的预约
CREATE POLICY "Salon owners can view salon appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM salon_spas 
            WHERE id = appointments.salon_spa_id 
            AND owner_id::text = auth.uid()::text
        )
    );

-- 管理员可以查看所有预约
CREATE POLICY "Admins can view all appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- 4. 系统设置表策略
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 所有人都可以查看系统设置
CREATE POLICY "Anyone can view system settings" ON system_settings
    FOR SELECT USING (true);

-- 只有管理员可以更新系统设置
CREATE POLICY "Only admins can update system settings" ON system_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- 5. 备份和日志表策略
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access backup logs" ON backup_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own login logs" ON login_logs
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all login logs" ON login_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );
```

#### 4.4 创建初始管理员用户

```sql
-- 创建管理员用户（请修改密码）
-- 注意：密码需要使用 bcrypt 加密，这里只是示例
INSERT INTO user_profiles (name, email, password, role) 
VALUES (
    '系统管理员', 
    'admin@example.com', 
    '$2a$10$example_hashed_password', -- 请使用实际的 bcrypt 加密密码
    'admin'
) ON CONFLICT (email) DO NOTHING;
```

> **重要提示**: 
> - 请确保将 `admin@example.com` 替换为实际的管理员邮箱
> - 密码必须使用 bcrypt 加密后存储
> - 建议在生产环境中使用强密码

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
│   ├── settings.ts   # 系统设置相关操作
│   └── users.ts
├── app/              # Next.js App Router
│   ├── (private)/    # 私有路由
│   │   ├── admin/    # 管理员页面
│   │   │   ├── appointments/  # 预约管理
│   │   │   ├── dashboard/     # 管理员仪表板
│   │   │   ├── salon-spas/    # 沙龙管理
│   │   │   └── settings/      # 系统设置
│   │   └── user/     # 用户页面
│   │       ├── appointments/      # 用户预约
│   │       ├── dashboard/         # 用户仪表板
│   │       ├── profile/           # 个人资料
│   │       └── schedule-appointment/ # 预约服务
│   └── (public)/     # 公共路由
│       ├── login/    # 登录页面
│       └── register/ # 注册页面
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
  - `registerUser()` - 用户注册
  - `loginUser()` - 用户登录
  - `getUserInfo()` - 获取用户信息
- `/actions/salon-spas.ts` - 沙龙管理操作
  - `getSalonSpasByOwner()` - 获取拥有者的沙龙列表
  - `deleteSalonSpaById()` - 删除沙龙
  - 沙龙的增删改查操作
- `/actions/appointments.ts` - 预约管理操作
  - `getAdminDashboardStats()` - 获取管理员仪表板统计
  - 预约的增删改查操作
- `/actions/settings.ts` - 系统设置操作
  - `updateUserProfile()` - 更新用户个人信息
  - `getSystemSettings()` - 获取系统设置
  - `updateSystemSettings()` - 更新系统设置
  - `createDataBackup()` - 创建数据备份
  - `getBackupHistory()` - 获取备份历史
  - `getLoginLogs()` - 获取登录日志
  - `logUserLogin()` - 记录登录日志

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 支持

如有问题，请提交 Issue 或联系开发团队。
