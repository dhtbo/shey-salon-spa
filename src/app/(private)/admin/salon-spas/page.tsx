import { Button } from '@/components/ui/button'
import PageTitle from '@/components/ui/page-title'
import Link from 'next/link'
import React from 'react'

function SalonSpasList() {
    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <PageTitle title="Salon Spas" />
                <Button>
                    <Link href="/admin/salon-spas/add">Add New Salon Spa</Link>
                </Button>

            </div>
        </div>
    )
}

export default SalonSpasList
