import { getSalonSpaById } from '@/actions/salon-spas'
import PageTitle from '@/components/ui/page-title'
import { ISalon_Spa } from '@/interfaces'
import React from 'react'
import Checkout from './_components/checkout'

interface Props {
    params: {
        id: string
    }
}

async function BookAppointmentPage({ params }: Props) {
    const { id }: any = await params
    const response = await getSalonSpaById(id)
    if (!response.success) {
        throw new Error(response.message)
    }

    const salonSpa: ISalon_Spa = response.data

    const renderProperty = (label: string, value: string) => {
        return (
            <div className="flex justify-between">
                <h1 className="text-sm text-gray-500">{label}:</h1>
                <h1 className="text-sm font-semibold!">{value}</h1>
            </div>
        )
    }

    return (
        <div>
            <PageTitle title="Book Appointment" />

            <div className="mt-7 grid grid-cols-3 gap-10">
                <div className="col-span-2 p-5 border border-gray-400 flex flex-col gap-1">
                    <p className="text-sm text-gray-700">
                        {salonSpa.description}
                    </p>
                    <hr className="border border-gray-300 my-5" />

                    {renderProperty('Name', salonSpa.name)}
                    {renderProperty('Address', salonSpa.address)}
                    {renderProperty('City', salonSpa.city)}
                    {renderProperty('State', salonSpa.state)}
                    {renderProperty('Zip Code', salonSpa.zip)}
                    {renderProperty('Minimum Price', salonSpa.min_service_price.toString())}
                    {renderProperty('Maximum Price', salonSpa.max_service_price.toString())}
                    {renderProperty('Offer Status', salonSpa.offer_status)}                    
                </div>
                <div className='col-span-1'>
                    <Checkout salonSpa={salonSpa} />
                </div>

            </div>
        </div>
    )
}

export default BookAppointmentPage