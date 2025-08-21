'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

function Homepage() {
  return (
    <div className="flex flex-col">
      <div className='flex justify-between items-center bg-gray-200  py-5 px-20'>
        <h1 className='text-2xl font-bold'>S.H.E.Y</h1>

        <Button>
          <Link href="/login">登录</Link>
        </Button>
      </div>

      <div className='bg-white mt-20 lg:grid-cols-2 grid-cols-1 px-20 min-h-[70vh] items-center grid gap-10'>
        <div className='col-span-1'>
          <div className='flex flex-col gap-5'>
            <h1 className='text-2xl font-bold!'>欢迎来到 S.H.E.Y</h1>
            <p className='text-sm'>我们是位于市中心的专业美容美发沙龙和水疗中心。</p>
            <Button className='w-max'>立即预约</Button>
          </div>
        </div>
        <div className='col-span-1 flex justify-end items-center'>
          <img src="https://img.freepik.com/premium-vector/man-hair-salon-logo-vector-illustration-white-background_1023984-42155.jpg" 
          className='h-96' />
        </div>
      </div>

    </div>
  )
}

export default Homepage
