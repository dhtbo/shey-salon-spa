'use client'

import { getAllSalonSpas } from '@/actions/salon-spas'
import Loader from '@/components/ui/loader'
import PageTitle from '@/components/ui/page-title'
import { ISalon_Spa } from '@/interfaces'
import { useRouter } from 'next/navigation'
import React, { use, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { set } from 'zod'

function ScheduleAppointment() {
  const [salonSpas, setSalonSpas] = useState([])
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)

  const fetchSalonSpa = async () => {
    try {
      setLoading(true)
      const response: any = await getAllSalonSpas()
      if (!response.success) {
        throw new Error(response.message)
      }
      setSalonSpas(response.data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalonSpa()
  }, [])


  return (
    <div>
      <div className='flex justify-between'>
        <PageTitle title="Schedule Appointme" />
      </div>

      {loading && <Loader />}

      {!loading && salonSpas?.length > 0 && (
        <div className='flex flex-col gap-7 mt-7'>
          {salonSpas.map((salonSpa: ISalon_Spa) => (
            <div key={salonSpa.id} 
            className='border border-gray-300 p-5 rounded cursor-pointer hover:border-gray-600'
            onClick={() => router.push(`/user/schedule-appointment/${salonSpa.id}`)}
            >

              <h1 className='text-sm font-bold! text-gray-800'>{salonSpa.name}</h1>
              <p className='text-sm text-gray-600'>{salonSpa.address}, {salonSpa.city}, {salonSpa.state}</p>

              <div className='mt-5'>
                <span className='text-xs font-semibold text-gray-800'>
                  Minimum Price: ${salonSpa.min_service_price}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>

  )
}
export default ScheduleAppointment