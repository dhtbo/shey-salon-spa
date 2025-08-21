'use client'

import { getAppointmentByUserid } from '@/actions/appointments'
import ErrorMessage from '@/components/ui/error-message'
import Loader from '@/components/ui/loader'
import PageTitle from '@/components/ui/page-title'
import { IAppointment } from '@/interfaces'
import useUsersGlobalStore, { IUsersGlobalStore } from '@/store/users-global-store'
import React from 'react'
import toast from 'react-hot-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import dayjs from 'dayjs'
import { appointmentStatus } from '@/constants'
import { updateAppointmentStatus } from '@/actions/appointments'



function userAppointmentsList() {
  const [appointments, setAppointments] = React.useState<IAppointment[]>([])
  const [loading, setLoading] = React.useState(false)

  const { user } = useUsersGlobalStore() as IUsersGlobalStore

  const fetchData = async () => {
    try {
      setLoading(true)
      const response: any = await getAppointmentByUserid(user?.id!)
      console.log(response)
      if (response.success) {
        setAppointments(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error("获取预约信息失败")
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const handleStatusChange = async (appointmentId: number, status: string) => {
    try {
      setLoading(true)
      const response: any = await updateAppointmentStatus(appointmentId, status)
      if (!response.success) throw new Error(response.message)

      toast.success(response.message)
      const updatedAppointments:any = appointments.map((appointment) => {
        if (appointment.id === appointmentId) {
          return { ...appointment, status }
        }
        return appointment
      })
      setAppointments(updatedAppointments)
    } catch (error) {
      toast.error("更新预约状态失败")
    } finally {
      setLoading(false)
    }

  }


  const columns = [
    "ID",
    "沙龙/水疗中心",
    "日期",
    "时间",
    "预约时间",
    "状态",
  ]


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageTitle title='我的预约' />

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无预约记录</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment: IAppointment) => (
                <TableRow key={appointment.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">#{appointment.id}</TableCell>
                  <TableCell className="font-medium">{appointment.salon_spa_data?.name || 'N/A'}</TableCell>
                  <TableCell>{dayjs(appointment.date).format('YYYY-MM-DD')}</TableCell>
                  <TableCell className="font-medium">{appointment.time}</TableCell>
                  <TableCell className="text-gray-500">{dayjs(appointment.created_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>
                    <select
                      value={appointment.status}
                      className={`border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        appointment.status === "已取消" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      } ${
                        appointment.status === "已预约" ? "text-blue-600 bg-blue-50" :
                        appointment.status === "已完成" ? "text-green-600 bg-green-50" :
                        "text-red-600 bg-red-50"
                      }`}
                      onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                      disabled={dayjs(appointment.date).isBefore(dayjs(),"day") || appointment.status === "已取消"}
                    >
                      {appointmentStatus.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default userAppointmentsList
