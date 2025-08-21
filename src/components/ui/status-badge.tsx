import React from 'react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'appointment' | 'salon'
  className?: string
}

const statusConfig = {
  appointment: {
    '已预约': 'bg-blue-100 text-blue-800',
    '已完成': 'bg-green-100 text-green-800',
    '已取消': 'bg-red-100 text-red-800',
  },
  salon: {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800',
  },
  default: {
    'success': 'bg-green-100 text-green-800',
    'warning': 'bg-yellow-100 text-yellow-800',
    'error': 'bg-red-100 text-red-800',
    'info': 'bg-blue-100 text-blue-800',
    'default': 'bg-gray-100 text-gray-800',
  }
}

const statusLabels = {
  appointment: {
    '已预约': '已预约',
    '已完成': '已完成',
    '已取消': '已取消',
  },
  salon: {
    'active': '营业中',
    'inactive': '暂停营业',
    'pending': '待审核',
  }
}

function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  const config = statusConfig[variant] || statusConfig.default
  const labels = statusLabels[variant as keyof typeof statusLabels]
  
  const colorClass = config[status as keyof typeof config] || config.default || 'bg-gray-100 text-gray-800'
  const label = labels?.[status as keyof typeof labels] || status

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorClass,
      className
    )}>
      {label}
    </span>
  )
}

export default StatusBadge