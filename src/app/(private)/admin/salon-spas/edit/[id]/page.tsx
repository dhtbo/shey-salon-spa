import PageTitle from '@/components/ui/page-title'
import React from 'react'
import SalonSpaForm from '../../_components/salon-spa-form'

function EditSalonSpa() {
  return (
    <div>
      <PageTitle title="Edit Salon Spa" />

      <SalonSpaForm formType="edit" />
    </div>
  )
}

export default EditSalonSpa
