import PageTitle from '@/components/ui/page-title'
import React from 'react'
import SalonSpaForm from '../_components/salon-spa-form'

function AddSalonSpa() {
  return (
    <div>
      <PageTitle title="Add New Salon Spa" />

      <SalonSpaForm formType="add" />

    </div>
  )
}

export default AddSalonSpa
