# UI 风格一致性分析报告

## 🔍 当前发现的问题

### 1. 页面布局不一致
- **管理员仪表板**: 使用 `space-y-6` 容器
- **沙龙管理页面**: 使用简单的 `<div>` 容器，缺少统一间距
- **用户预约页面**: 使用简单的 `<div>` 容器
- **设置页面**: 使用 `space-y-6` 容器

### 2. 加载状态显示不一致
- **仪表板页面**: 居中显示加载器 `min-h-[400px]`
- **沙龙管理**: 直接显示 `<Loader />`
- **用户预约**: 直接显示 `<Loader />`

### 3. 错误处理不一致
- **仪表板**: 使用 `<ErrorMessage error={error} />`
- **用户预约**: 使用 `<ErrorMessage error="暂无预约记录" />`
- **沙龙管理**: 使用 `toast.error()`

### 4. 表格样式不一致
- **表头样式**: 都使用 `bg-gray-100`，这个是一致的
- **表格容器**: 有些有 `className="w-full"`，有些没有

### 5. 按钮样式不一致
- **沙龙管理**: 使用 `variant="outline"` + `size="icon"`
- **用户预约**: 使用原生 `<select>` 而不是统一的 Select 组件

### 6. 卡片组件使用不一致
- **仪表板**: 统一使用 Card 组件，有 hover 效果
- **个人资料**: 使用 Card 组件，有 hover 效果
- **其他页面**: 缺少卡片包装

## 🎯 建议的统一设计规范

### 1. 页面容器规范
```tsx
<div className="space-y-6">
  <PageTitle title="页面标题" />
  {/* 页面内容 */}
</div>
```

### 2. 加载状态规范
```tsx
if (loading) {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader />
    </div>
  )
}
```

### 3. 错误处理规范
```tsx
if (error) {
  return <ErrorMessage error={error} />
}
```

### 4. 空状态规范
```tsx
if (!loading && data.length === 0) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">暂无数据</p>
    </div>
  )
}
```

### 5. 表格容器规范
```tsx
<div className="bg-white rounded-lg shadow-sm border">
  <Table className="w-full">
    <TableHeader>
      <TableRow className="bg-gray-50">
        {/* 表头内容 */}
      </TableRow>
    </TableHeader>
    <TableBody>
      {/* 表格内容 */}
    </TableBody>
  </Table>
</div>
```

### 6. 操作按钮规范
```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm">
    <Edit2 size={16} />
    编辑
  </Button>
  <Button variant="outline" size="sm">
    <Trash2 size={16} />
    删除
  </Button>
</div>
```

### 7. 统计卡片规范
```tsx
<Card className="hover:shadow-lg transition-shadow duration-200">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium text-gray-600">
      {title}
    </CardTitle>
    <div className={`p-2 rounded-full ${bgColor}`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-gray-900 mb-1">
      {value}
    </div>
    <p className="text-xs text-gray-500">
      {description}
    </p>
  </CardContent>
</Card>
```