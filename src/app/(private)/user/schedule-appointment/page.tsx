'use client'

import { getAllSalonSpas } from '@/actions/salon-spas'
import Loader from '@/components/ui/loader'
import PageTitle from '@/components/ui/page-title'
import { ISalon_Spa } from '@/interfaces'
import { useRouter } from 'next/navigation'
import React, { use, useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { set } from 'zod'
import LocationSearch from './_components/location-search'
import SortFilter, { SortFilterOption } from './_components/sort-filter'

function ScheduleAppointment() {
  const [salonSpas, setSalonSpas] = useState([])
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number, locationName: string} | null>(null)
  const [sortFilter, setSortFilter] = useState<SortFilterOption>('all')

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


  // 计算距离的函数 (使用 Haversine 公式)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 地球半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 筛选和排序后的沙龙数据
  const filteredAndSortedSalonSpas = useMemo(() => {
    let filtered = [...salonSpas];

    // 根据筛选条件过滤
    switch (sortFilter) {
      case 'nearby':
        if (userLocation) {
          // 只显示距离用户位置50km以内的沙龙
          filtered = filtered.filter((salon: ISalon_Spa) => {
            if (!salon.latitude || !salon.longitude) return false;
            const distance = calculateDistance(
               userLocation.latitude,
               userLocation.longitude,
               salon.latitude,
               salon.longitude
             );
            return distance <= 20; // 50km范围内
          });
        }
        break;
      case 'with_offers':
        filtered = filtered.filter((salon: ISalon_Spa) => salon.offer_status === 'active');
        break;
      default:
        // 'all' 不需要额外过滤
        break;
    }

    // 根据排序条件排序
    switch (sortFilter) {
      case 'nearby':
        if (userLocation) {
          filtered.sort((a: ISalon_Spa, b: ISalon_Spa) => {
            if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
            const distanceA = calculateDistance(
               userLocation.latitude,
               userLocation.longitude,
               a.latitude,
               a.longitude
             );
             const distanceB = calculateDistance(
               userLocation.latitude,
               userLocation.longitude,
               b.latitude,
               b.longitude
             );
            return distanceA - distanceB;
          });
        }
        break;
      case 'price_low_to_high':
        filtered.sort((a: ISalon_Spa, b: ISalon_Spa) => 
          (a.min_service_price || 0) - (b.min_service_price || 0)
        );
        break;
      case 'price_high_to_low':
        filtered.sort((a: ISalon_Spa, b: ISalon_Spa) => 
          (b.min_service_price || 0) - (a.min_service_price || 0)
        );
        break;
      default:
        // 'all' 和 'with_offers' 保持原始顺序
        break;
    }

    return filtered;
  }, [salonSpas, sortFilter, userLocation]);

  // 处理地址搜索变化
  const handleLocationChange = (location: {latitude: number, longitude: number, locationName: string} | null) => {
    setUserLocation(location);
    // 如果用户选择了新位置且当前筛选是"附近"，保持附近筛选
    if (location && sortFilter === 'nearby') {
      // 触发重新筛选
    }
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <PageTitle title="Schedule Appointment" />
      </div>

      {/* 搜索和筛选区域 */}
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex-1'>
          <LocationSearch 
            onLocationChange={handleLocationChange}
            placeholder="Search for a location..."
          />
        </div>
        <div className='md:w-auto'>
          <SortFilter 
            value={sortFilter}
            onValueChange={setSortFilter}
          />
        </div>
      </div>

      {loading && <Loader />}

      {!loading && filteredAndSortedSalonSpas?.length > 0 && (
        <div className='flex flex-col gap-7 mt-7'>
          {filteredAndSortedSalonSpas.map((salonSpa: ISalon_Spa) => {
            let distanceText = '';
            if (userLocation && salonSpa.latitude && salonSpa.longitude) {
              const distance = calculateDistance(
                 userLocation.latitude,
                 userLocation.longitude,
                 salonSpa.latitude,
                 salonSpa.longitude
               );
              distanceText = distance < 1 
                ? `${(distance * 1000).toFixed(0)}m away`
                : `${distance.toFixed(1)}km away`;
            }

            return (
              <div key={salonSpa.id} 
                className='border border-gray-300 p-5 rounded cursor-pointer hover:border-gray-600 transition-colors'
                onClick={() => router.push(`/user/schedule-appointment/${salonSpa.id}`)}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <h1 className='text-sm font-bold text-gray-800'>{salonSpa.name}</h1>
                    <p className='text-sm text-gray-600'>{salonSpa.address}, {salonSpa.city}, {salonSpa.state}</p>
                    {distanceText && (
                      <p className='text-xs text-blue-600 mt-1'>{distanceText}</p>
                    )}
                  </div>
                  {salonSpa.offer_status === 'active' && (
                    <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full'>
                      有优惠
                    </span>
                  )}
                </div>

                <div className='mt-5'>
                  <span className='text-xs font-semibold text-gray-800'>
                    Minimum Price: ${salonSpa.min_service_price}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredAndSortedSalonSpas?.length === 0 && salonSpas?.length > 0 && (
        <div className='text-center py-8 text-gray-500'>
          <p>No salon spas found matching your criteria.</p>
          <p className='text-sm mt-2'>Try adjusting your search location or filter options.</p>
        </div>
      )}

      {!loading && salonSpas?.length === 0 && (
        <div className='text-center py-8 text-gray-500'>
          <p>No salon spas available at the moment.</p>
        </div>
      )}

    </div>

  )
}
export default ScheduleAppointment