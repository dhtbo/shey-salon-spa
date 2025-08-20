'use server'

import supabase from "@/config/supabase-config"
import { IAppointment, ISalon_Spa } from "@/interfaces"


export const bookNewAppointment = async (data: any) => {
  try {
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert([data])
      .select()
      .single()
    if (error) throw error
    return {
      success: true,
      data: appointment,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    }
  }
}

export const getAppointmentByUserid = async (userId: number) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, salon_spas(id,name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return {
      success: true,
      data: data.map((item: any) => ({
        ...item,
        salon_spa_data: item.salon_spas,
      })),
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message + " Please try again later",

    }
  }
}

export const getAppointmentsByOwnerId = async (ownerId: number, filters:{
  status?: string | null,
  date?: string | null,
  salon_spa_Id?: number | null,
}) => {
  try {
    let qry = supabase
    .from("appointments")
    .select("*, salon_spas(id,name),user_profiles(id,name)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

    if (filters.status) {
      qry = qry.eq("status", filters.status)
    }
    if (filters.date) {
      qry = qry.eq("date", filters.date)
    }
    if (filters.salon_spa_Id) {
      qry = qry.eq("salon_spa_id", filters.salon_spa_Id)
    }
    
    const { data, error } = await qry
    if (error) throw error
    return {
      success: true,
      data: data.map((item: any) => ({
        ...item,
        salon_spa_data: item.salon_spas,
        user_profile_data: item.user_profiles,
      })),
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    }
  }
}

export const getSalonSpasAvailability = async ({ date, time, salonSpaData }: {
  date: string,
  time: string,
  salonSpaData: ISalon_Spa
}) => {
  try {
    const { data: bookedAppointments, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("salon_spa_id", salonSpaData.id)
      .eq("date", date)
      .eq("time", time)

    if (error) throw new Error(error.message)

    if (bookedAppointments.length >= salonSpaData.max_bookings_per_slot) {
      return {
        success: false,
        message: "No available slots",
      }
    }

    return {
      success: true,
      data: {
        availableSlots: salonSpaData.max_bookings_per_slot - bookedAppointments.length,
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    }
  }
}

export const updateAppointmentStatus = async (appointmentId: number, status: string) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId)
    if (error) throw error
    return {
      success: true,
      data: data,
      message: "Appointment status updated successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    }
  }
}
