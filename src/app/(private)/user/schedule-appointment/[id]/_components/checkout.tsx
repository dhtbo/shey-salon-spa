'use client'

import React from 'react'
import { ISalon_Spa } from '@/interfaces'
import DatePicker from "react-datepicker"

import "react-datepicker/dist/react-datepicker.css"
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'
import useUsersGlobalStore, { IUsersGlobalStore } from '@/store/users-global-store'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { bookNewAppointment, getSalonSpasAvailability } from '@/actions/appointments'

function Checkout({ salonSpa }: { salonSpa: ISalon_Spa }) {
  const [date, setDate] = React.useState(new Date())
  const [time, setTime] = React.useState('9:00 AM')
  const [loading, setLoading] = React.useState(false)
  const { user } = useUsersGlobalStore() as IUsersGlobalStore
  const [availableSlots, setAvailableSlots] = React.useState(0)
  const [availabilytyError, setAvailabilytyError] = React.useState("")

  const router = useRouter()

  const timeOptions = []
  const sampleDate = dayjs(date).format("YYYY-MM-DD")

  let currentSlot = dayjs(`${sampleDate} ${salonSpa.start_time}`)
  const endTime = dayjs(`${sampleDate} ${salonSpa.end_time}`)

  while (currentSlot.isBefore(endTime)) {
    timeOptions.push({
      label: currentSlot.format("h:mm A"),
      value: currentSlot.format("h:mm A"),
    })
    currentSlot = currentSlot.add(salonSpa.slot_duration, "minute")
  }

  const bookAppointmentHandler = async () => {
    try {
      setLoading(true)
      const payload = {
        user_id: user?.id,
        salon_spa_id: salonSpa.id,
        owner_id: salonSpa.owner_id,
        date: dayjs(date).format("YYYY-MM-DD"),
        time,
        status: "booked",
      }

      const response = await bookNewAppointment(payload)
      if (!response.success) {
        throw new Error(response.message)
      }
      toast.success('Appointment booked successfully')
      setLoading(false)
      router.push('/user/appointments')
    } catch (error) {
      toast.error('Error booking appointment')
    }

  }

  const fetchAvailableSlots = async () => {
    try {
      const response: any = await getSalonSpasAvailability({
        salonSpaData: salonSpa,
        date: dayjs(date).format("YYYY-MM-DD"),
        time,
      })
      if (!response.success) {
        setAvailableSlots(0)
        setAvailabilytyError(response.message)

      }
      setAvailableSlots(response.data?.availableSlots)
    } catch (error: any) {
      toast.error(error.message)

    }
  }

  React.useEffect(() => {
    if (date && time) {
      setAvailableSlots(0)
      setAvailabilytyError("")
      fetchAvailableSlots()
    }
  }, [date, time])


  return (
    <div className='border border-gray-400 flex flex-col gap-5 p-5'>
      <div className="flex flex-col gap-1">
        <span className='text-sm'>Select Date</span>
        <DatePicker
          selected={date}
          onChange={(value) => setDate(value as Date)}
          dateFormat="yyyy-MM-dd"
          className="border border-gray-700 p-2"
          minDate={new Date()}
          filterDate={(date) => {
            const day = dayjs(date).format("dddd").toLowerCase()
            return salonSpa?.working_days?.includes(day) || false;
          }}

        />
      </div>
      <div className="flex flex-col gap-1">
        <span className='text-sm'>Select Time</span>
        <select className="border border-gray-700 p-2"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        >
          {timeOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {availabilytyError && (
        <span className='text-red-700 text-sm'>{availabilytyError}</span>
      )}

      {availableSlots > 0 && (
        <span className='text-green-700 text-sm'>{availableSlots} slots available</span>
      )}

      {/* 添加两个按钮 */}
      <div className="flex justify-end">
        <Button variant="outline" disabled={loading}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button className="ml-3"
          disabled={loading || availableSlots === 0}
          onClick={bookAppointmentHandler}
        >
          Book Appointment
        </Button>
      </div>

    </div>
  )
}

export default Checkout