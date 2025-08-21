'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PageTitle from '@/components/ui/page-title'
import Loader from '@/components/ui/loader'
import ErrorMessage from '@/components/ui/error-message'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import useUsersGlobalStore, { IUsersGlobalStore } from '@/store/users-global-store'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { 
  updateUserProfile, 
  getSystemSettings, 
  updateSystemSettings, 
  createDataBackup,
  getBackupHistory,
  getLoginLogs
} from '@/actions/settings'
import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  Settings as SettingsIcon,
  Globe,
  Clock
} from 'lucide-react'

interface ProfileFormData {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface SystemSettings {
  siteName: string
  siteDescription: string
  timezone: string
  language: string
  maintenanceMode: boolean
  allowRegistration: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  autoBackup: boolean
  backupFrequency: string
}

function AdminSettingsPage() {
  const { user } = useUsersGlobalStore() as IUsersGlobalStore
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [backupHistory, setBackupHistory] = useState<any[]>([])
  const [loginLogs, setLoginLogs] = useState<any[]>([])

  // 个人信息表单
  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // 系统设置状态
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: '美容预约系统',
    siteDescription: '专业的美容沙龙预约管理平台',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily'
  })

  // 更新个人信息
  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      setLoading(true)
      
      // 验证密码
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        toast.error('新密码和确认密码不匹配')
        return
      }

      if (!user?.id) {
        toast.error('用户信息不存在')
        return
      }

      // 调用更新用户信息的API
      const response = await updateUserProfile(user.id, {
        name: data.name,
        email: data.email,
        currentPassword: data.currentPassword || undefined,
        newPassword: data.newPassword || undefined
      })
      
      if (!response.success) {
        toast.error(response.message)
        return
      }
      
      toast.success('个人信息更新成功')
      
      // 清空密码字段
      profileForm.setValue('currentPassword', '')
      profileForm.setValue('newPassword', '')
      profileForm.setValue('confirmPassword', '')
      
    } catch (error: any) {
      toast.error(error.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  // 更新系统设置
  const onUpdateSystemSettings = async () => {
    try {
      setLoading(true)
      
      // 调用更新系统设置的API
      const response = await updateSystemSettings({
        siteName: systemSettings.siteName,
        siteDescription: systemSettings.siteDescription,
        timezone: systemSettings.timezone,
        language: systemSettings.language,
        maintenanceMode: systemSettings.maintenanceMode,
        allowRegistration: systemSettings.allowRegistration,
        emailNotifications: systemSettings.emailNotifications,
        smsNotifications: systemSettings.smsNotifications,
        autoBackup: systemSettings.autoBackup,
        backupFrequency: systemSettings.backupFrequency
      })
      
      if (!response.success) {
        toast.error(response.message)
        return
      }
      
      toast.success('系统设置更新成功')
      
    } catch (error: any) {
      toast.error(error.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  // 执行数据备份
  const handleBackup = async () => {
    try {
      setLoading(true)
      
      // 调用数据备份的API
      const response = await createDataBackup()
      
      if (!response.success) {
        toast.error(response.message)
        return
      }
      
      toast.success('数据备份完成')
      
    } catch (error: any) {
      toast.error(error.message || '备份失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载初始数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true)
        
        // 加载系统设置
        const settingsResponse = await getSystemSettings()
        if (settingsResponse.success && settingsResponse.data) {
          const data = settingsResponse.data
          setSystemSettings({
            siteName: data.site_name || '美容预约系统',
            siteDescription: data.site_description || '专业的美容沙龙预约管理平台',
            timezone: data.timezone || 'Asia/Shanghai',
            language: data.language || 'zh-CN',
            maintenanceMode: data.maintenance_mode || false,
            allowRegistration: data.allow_registration !== false,
            emailNotifications: data.email_notifications !== false,
            smsNotifications: data.sms_notifications || false,
            autoBackup: data.auto_backup !== false,
            backupFrequency: data.backup_frequency || 'daily'
          })
        }

        // 加载备份历史
        const backupResponse = await getBackupHistory()
        if (backupResponse.success) {
          setBackupHistory(backupResponse.data)
        }

        // 加载登录日志
        if (user?.id) {
          const logsResponse = await getLoginLogs(user.id)
          if (logsResponse.success) {
            setLoginLogs(logsResponse.data)
          }
        }
        
      } catch (error: any) {
        console.error('加载初始数据失败:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadInitialData()
  }, [user])

  // 更新表单默认值当用户信息变化时
  useEffect(() => {
    if (user) {
      profileForm.setValue('name', user.name || '')
      profileForm.setValue('email', user.email || '')
    }
  }, [user, profileForm])

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: '个人信息', icon: User },
    { id: 'system', label: '系统设置', icon: SettingsIcon },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'backup', label: '数据备份', icon: Database }
  ]

  return (
    <div className="space-y-6">
      <PageTitle title="系统设置" />
      
      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 个人信息设置 */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              个人信息设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>姓名</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入姓名" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="请输入邮箱" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">修改密码</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>当前密码</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="请输入当前密码" 
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>新密码</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                type={showNewPassword ? "text" : "password"}
                                placeholder="请输入新密码" 
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>确认新密码</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="请确认新密码" 
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader /> : <Save size={16} />}
                    保存更改
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* 系统设置 */}
      {activeTab === 'system' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon size={20} />
              系统设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">网站名称</Label>
                <Input
                  id="siteName"
                  value={systemSettings.siteName}
                  onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                  placeholder="请输入网站名称"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">时区</Label>
                <Select 
                  value={systemSettings.timezone} 
                  onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择时区" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Shanghai">中国标准时间 (GMT+8)</SelectItem>
                    <SelectItem value="America/New_York">美国东部时间 (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">英国时间 (GMT+0)</SelectItem>
                    <SelectItem value="Asia/Tokyo">日本时间 (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">网站描述</Label>
              <Input
                id="siteDescription"
                value={systemSettings.siteDescription}
                onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
                placeholder="请输入网站描述"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="language">系统语言</Label>
                <Select 
                  value={systemSettings.language} 
                  onValueChange={(value) => setSystemSettings({...systemSettings, language: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">系统功能</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maintenanceMode"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, maintenanceMode: checked as boolean})
                    }
                  />
                  <Label htmlFor="maintenanceMode" className="flex items-center gap-2">
                    <RefreshCw size={16} />
                    维护模式
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowRegistration"
                    checked={systemSettings.allowRegistration}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, allowRegistration: checked as boolean})
                    }
                  />
                  <Label htmlFor="allowRegistration" className="flex items-center gap-2">
                    <User size={16} />
                    允许用户注册
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={onUpdateSystemSettings} disabled={loading}>
                {loading ? <Loader /> : <Save size={16} />}
                保存设置
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 通知设置 */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} />
              通知设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailNotifications"
                  checked={systemSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSystemSettings({...systemSettings, emailNotifications: checked as boolean})
                  }
                />
                <Label htmlFor="emailNotifications" className="flex items-center gap-2">
                  <Mail size={16} />
                  邮件通知
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smsNotifications"
                  checked={systemSettings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setSystemSettings({...systemSettings, smsNotifications: checked as boolean})
                  }
                />
                <Label htmlFor="smsNotifications" className="flex items-center gap-2">
                  <Bell size={16} />
                  短信通知
                </Label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={onUpdateSystemSettings} disabled={loading}>
                {loading ? <Loader /> : <Save size={16} />}
                保存设置
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 安全设置 */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              安全设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Lock size={16} />
                <span className="font-medium">安全提示</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                定期更改密码，启用双因素认证，确保账户安全。
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">双因素认证</h4>
                  <p className="text-sm text-gray-500">为您的账户添加额外的安全层</p>
                </div>
                <Button variant="outline">
                  启用
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">登录日志</h4>
                    <p className="text-sm text-gray-500">查看最近的登录活动</p>
                  </div>
                </div>
                
                {loginLogs.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {loginLogs.map((log, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                        <div>
                          <span className="font-medium">IP: {log.ip_address}</span>
                          <span className="text-gray-500 ml-2">
                            {new Date(log.login_time).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <span className="text-green-600 text-xs">成功</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">暂无登录记录</p>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">会话管理</h4>
                  <p className="text-sm text-gray-500">管理活跃的登录会话</p>
                </div>
                <Button variant="outline">
                  管理会话
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 数据备份 */}
      {activeTab === 'backup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} />
              数据备份
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoBackup"
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => 
                    setSystemSettings({...systemSettings, autoBackup: checked as boolean})
                  }
                />
                <Label htmlFor="autoBackup" className="flex items-center gap-2">
                  <Clock size={16} />
                  自动备份
                </Label>
              </div>

              {systemSettings.autoBackup && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="backupFrequency">备份频率</Label>
                  <Select 
                    value={systemSettings.backupFrequency} 
                    onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="选择备份频率" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">每日</SelectItem>
                      <SelectItem value="weekly">每周</SelectItem>
                      <SelectItem value="monthly">每月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">手动备份</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg mb-6">
                <div>
                  <h4 className="font-medium">立即备份</h4>
                  <p className="text-sm text-gray-500">创建当前数据的完整备份</p>
                </div>
                <Button onClick={handleBackup} disabled={loading}>
                  {loading ? <Loader /> : <Database size={16} />}
                  开始备份
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">备份历史</h3>
                {backupHistory.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {backupHistory.map((backup, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{backup.backup_name}</h4>
                          <p className="text-xs text-gray-500">
                            大小: {(backup.backup_size / 1024 / 1024).toFixed(2)} MB | 
                            类型: {backup.backup_type === 'manual' ? '手动' : '自动'} | 
                            时间: {new Date(backup.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            backup.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {backup.status === 'completed' ? '完成' : '进行中'}
                          </span>
                          <Button variant="outline" size="sm">
                            下载
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">暂无备份记录</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={onUpdateSystemSettings} disabled={loading}>
                {loading ? <Loader /> : <Save size={16} />}
                保存设置
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdminSettingsPage