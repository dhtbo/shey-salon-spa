'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PageTitle from '@/components/ui/page-title'
import useUsersGlobalStore, { IUsersGlobalStore } from '@/store/users-global-store'
import { User, Mail, Hash, Shield, Calendar } from 'lucide-react'
import dayjs from 'dayjs'

function UserProfilePage() {
  const { user } = useUsersGlobalStore() as IUsersGlobalStore

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">用户信息未找到</p>
        </div>
      </div>
    )
  }

  const userInfoItems = [
    {
      label: '姓名',
      value: user.name,
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: '电子邮箱',
      value: user.email,
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: '用户ID',
      value: user.id.toString(),
      icon: Hash,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: '角色',
      value: user.role === 'admin' ? '管理员' : '用户',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: '创建时间',
      value: dayjs(user.created_at).format('YYYY年MM月DD日 HH:mm'),
      icon: Calendar,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ]

  return (
    <div className="space-y-6">
      <PageTitle title="个人信息" />
      
      <div className="w-full mx-auto">

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              用户详细信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userInfoItems.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className={`p-3 rounded-full ${item.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {item.label}
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            账户状态: <span className={`font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {user.is_active ? '活跃' : '已停用'}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            最后更新: {dayjs(user.updated_at).format('YYYY年MM月DD日 HH:mm')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage