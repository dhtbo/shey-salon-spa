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


  return (
    <div>
      <PageTitle title='我的预约' />

      {loading && <Loader />}

      {!loading && appointments.length === 0 && (
        <ErrorMessage error="暂无预约记录" />
      )}

      {!loading && appointments.length > 0 && (
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-100">
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment: IAppointment) => (
              <TableRow key={appointment.id} className="p-2">
                <TableCell>{appointment.id}</TableCell>
                <TableCell>{appointment.salon_spa_data?.name || 'N/A'}</TableCell>
                <TableCell>{dayjs(appointment.date).format('YYYY-MM-DD')}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{dayjs(appointment.created_at).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell>
                  <select
                    value={appointment.status}
                    className={`border border-gray-300 rounded-md p-1 ${appointment.status === "已取消" ? "opacity-50 pointer-none:" : ""}`}
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
      )}
    </div>
  )
}

export default userAppointmentsList
