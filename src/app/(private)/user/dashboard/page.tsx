'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PageTitle from '@/components/ui/page-title'
import Loader from '@/components/ui/loader'
import ErrorMessage from '@/components/ui/error-message'
import { getUserDashboardStats } from '@/actions/appointments'
import { Calendar, CalendarX, CheckCircle, Clock } from 'lucide-react'
import useUsersGlobalStore, { IUsersGlobalStore } from '@/store/users-global-store'

interface DashboardStats {
  totalBookings: number
  canceledBookings: number
  completedBookings: number
  upcomingBookings: number
}

function UserDashboardPage() {
  const { user } = useUsersGlobalStore() as IUsersGlobalStore
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        setError('用户信息未找到')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response:any = await getUserDashboardStats(user.id)
        if (response.success) {
          setStats(response.data)
        } else {
          setError(response.message || 'Failed to fetch dashboard stats')
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage error={error} />
  }

  const statsCards = [
    {
      title: '我的总预约数',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: '我的所有预约总数'
    },
    {
      title: '我的已取消预约',
      value: stats?.canceledBookings || 0,
      icon: CalendarX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: '我已取消的预约数量'
    },
    {
      title: '我的已完成预约',
      value: stats?.completedBookings || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: '我已完成的预约数量'
    },
    {
      title: '我的即将到来预约',
      value: stats?.upcomingBookings || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: '我即将到来的预约数量'
    }
  ]

  return (
    <div className="space-y-6">
      <PageTitle title={`Welcome, ${user?.name || 'User'}!`} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {card.value}
                </div>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        显示您个人的预约统计信息，数据实时更新
      </div>
    </div>
  )
}

export default UserDashboardPage
