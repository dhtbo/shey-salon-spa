import PageTitle from '@/components/ui/page-title'
import React from 'react'
import SalonSpaForm from '../_components/salon-spa-form'

function AddSalonSpa() {
  return (
    <div>
      <PageTitle title="添加新沙龙" />

      <SalonSpaForm formType="add" />

    </div>
  )
}

export default AddSalonSpa
