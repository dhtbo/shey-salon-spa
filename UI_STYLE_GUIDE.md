# UI 风格指南

## 🎨 设计系统概览

本项目采用统一的设计系统，确保所有页面和组件的视觉一致性。

## 📐 布局规范

### 页面容器
```tsx
// 推荐使用 PageContainer 组件
<PageContainer 
  title="页面标题"
  description="页面描述（可选）"
  loading={loading}
  error={error}
  actions={<Button>操作按钮</Button>}
>
  {/* 页面内容 */}
</PageContainer>

// 或者手动使用
<div className="space-y-6">
  <PageTitle title="页面标题" description="页面描述" />
  {/* 页面内容 */}
</div>
```

### 间距规范
- 页面级间距：`space-y-6`
- 组件间间距：`gap-4` 或 `gap-6`
- 内容间距：`space-y-4`

## 🎯 组件使用规范

### 1. 页面标题 (PageTitle)
```tsx
<PageTitle 
  title="页面标题" 
  description="可选的页面描述"
/>
```

### 2. 数据表格 (DataTable)
```tsx
<DataTable
  columns={[
    { key: 'name', label: '名称', className: 'font-medium' },
    { key: 'status', label: '状态' }
  ]}
  data={data}
  loading={loading}
  emptyMessage="暂无数据"
  renderCell={(item, column) => {
    if (column.key === 'status') {
      return <StatusBadge status={item.status} variant="appointment" />
    }
    return item[column.key]
  }}
/>
```

### 3. 状态徽章 (StatusBadge)
```tsx
// 预约状态
<StatusBadge status="已预约" variant="appointment" />

// 沙龙状态
<StatusBadge status="active" variant="salon" />

// 自定义状态
<StatusBadge status="success" variant="default" />
```

### 4. 加载状态
```tsx
// 页面级加载
if (loading) {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader />
    </div>
  )
}

// 组件级加载
{loading && <Loader />}
```

### 5. 空状态
```tsx
{data.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-500">暂无数据</p>
  </div>
)}
```

### 6. 错误状态
```tsx
{error && <ErrorMessage error={error} />}
```

## 🎨 颜色规范

### 主要颜色
- **主色调**: `text-blue-600`, `bg-blue-50`
- **成功**: `text-green-600`, `bg-green-50`
- **警告**: `text-orange-600`, `bg-orange-50`
- **错误**: `text-red-600`, `bg-red-50`
- **中性**: `text-gray-600`, `bg-gray-50`

### 状态颜色
```css
/* 预约状态 */
.status-booked { @apply bg-blue-100 text-blue-800; }
.status-completed { @apply bg-green-100 text-green-800; }
.status-cancelled { @apply bg-red-100 text-red-800; }

/* 沙龙状态 */
.status-active { @apply bg-green-100 text-green-800; }
.status-inactive { @apply bg-gray-100 text-gray-800; }
```

## 📊 表格规范

### 基础表格结构
```tsx
<div className="bg-white rounded-lg shadow-sm border">
  <Table className="w-full">
    <TableHeader>
      <TableRow className="bg-gray-50">
        <TableHead>列标题</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-gray-50">
        <TableCell className="font-medium">内容</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### 表格样式规范
- **表头**: `bg-gray-50`
- **行悬停**: `hover:bg-gray-50`
- **重要内容**: `font-medium`
- **次要内容**: `text-gray-500`
- **数字**: `text-green-600 font-medium`（价格等）

## 🔘 按钮规范

### 主要操作按钮
```tsx
<Button>主要操作</Button>
<Button variant="outline">次要操作</Button>
```

### 图标按钮
```tsx
<Button variant="outline" size="sm">
  <Edit2 size={16} />
  编辑
</Button>

<Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
  <Trash2 size={16} />
  删除
</Button>
```

### 按钮组
```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm">编辑</Button>
  <Button variant="outline" size="sm">删除</Button>
</div>
```

## 📝 表单规范

### 表单容器
```tsx
<Card>
  <CardHeader>
    <CardTitle>表单标题</CardTitle>
  </CardHeader>
  <CardContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 表单字段 */}
      </form>
    </Form>
  </CardContent>
</Card>
```

### 表单布局
```tsx
// 单列布局
<div className="space-y-4">
  <FormField />
  <FormField />
</div>

// 双列布局
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <FormField />
  <FormField />
</div>
```

## 📱 响应式规范

### 网格布局
```tsx
// 统计卡片
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// 表单字段
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// 内容区域
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
```

### 断点使用
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+

## 🎭 动画和过渡

### 悬停效果
```tsx
className="hover:shadow-lg transition-shadow duration-200"
className="hover:bg-gray-50 transition-colors"
```

### 加载动画
```tsx
className="animate-spin" // 旋转动画
className="animate-pulse" // 脉冲动画
```

## 📋 最佳实践

### 1. 组件复用
- 优先使用统一的UI组件
- 避免重复的样式代码
- 保持组件的一致性

### 2. 状态管理
- 统一的加载状态处理
- 一致的错误信息显示
- 标准化的空状态展示

### 3. 交互反馈
- 按钮点击反馈
- 表单验证提示
- 操作成功/失败通知

### 4. 可访问性
- 合理的颜色对比度
- 键盘导航支持
- 屏幕阅读器友好

## 🔧 开发工具

### 推荐的VS Code扩展
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Prettier - Code formatter

### 代码格式化
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## 📚 参考资源

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Radix UI 组件库](https://www.radix-ui.com/)
- [Lucide React 图标](https://lucide.dev/)
- [React Hook Form](https://react-hook-form.com/)

---

遵循这些规范可以确保整个应用的UI保持一致性和专业性。如有疑问或需要添加新的设计规范，请及时更新此文档。