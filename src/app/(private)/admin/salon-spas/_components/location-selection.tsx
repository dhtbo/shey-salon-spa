"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";

// 使用高德地图v3 REST API进行搜索，JS SDK用于地图显示
declare global {
  interface Window {
    AMap: any;
  }
}

type Suggestion = {
  place_id: string;
  display_name: string;
  lon: number;
  lat: number;
};

type SelectedLocation = {
  latitude: string;
  longitude: string;
  locationName?: string;
};

type LocationSelectionProps = {
  initialLocation?: Partial<SelectedLocation>;
  onLocationChange?: (loc: SelectedLocation) => void;
};

const LocationSelection: React.FC<LocationSelectionProps> = ({
  initialLocation,
  onLocationChange,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);
  const ipLocationAbortRef = useRef<AbortController | null>(null);

  // 加载高德地图JS SDK（用于地图显示）
  const loadAmapAPI = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        setMapLoaded(true);
        resolve();
        return;
      }

      const key = process.env.NEXT_PUBLIC_AMAP_KEY;
      if (!key) {
        const errorMsg = '高德地图API密钥未配置';
        setMapError(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${key}`;
      
      script.onerror = (error) => {
        const errorMsg = '高德地图JS SDK加载失败，请检查网络连接';
        setMapError(errorMsg);
        reject(error);
      };
      
      script.onload = () => {
        if (window.AMap) {
          setMapLoaded(true);
          setMapError(null);
          resolve();
        } else {
          const errorMsg = 'API密钥无效或地图SDK初始化失败';
          setMapError(errorMsg);
          reject(new Error(errorMsg));
        }
      };
      
      // 添加超时处理
      setTimeout(() => {
        if (!window.AMap) {
          const errorMsg = '高德地图JS SDK加载超时';
          setMapError(errorMsg);
          reject(new Error(errorMsg));
        }
      }, 10000); // 10秒超时
      
      document.head.appendChild(script);
    });
  }, []);

  // 使用高德地图API获取用户IP地理位置
  const getUserLocationByIP = useCallback(async (): Promise<{lat: number, lon: number} | null> => {
    try {
      ipLocationAbortRef.current?.abort();
      ipLocationAbortRef.current = new AbortController();
      
      const key = process.env.NEXT_PUBLIC_AMAP_KEY;
      if (!key) return null;
      
      const response = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`, {
        signal: ipLocationAbortRef.current.signal
      });
      const data = await response.json();
      
      if (data.status === '1' && data.rectangle) {
        // 高德返回的是矩形区域，取中心点
        const coords = data.rectangle.split(';');
        if (coords.length >= 2) {
          const [lon1, lat1] = coords[0].split(',').map(Number);
          const [lon2, lat2] = coords[1].split(',').map(Number);
          const centerLon = (lon1 + lon2) / 2;
          const centerLat = (lat1 + lat2) / 2;
          
          return {
            lat: centerLat,
            lon: centerLon
          };
        }
      }
    } catch (error) {
      // IP定位失败，静默处理
    }
    return null;
  }, []);

  // 高德地图v3 REST API逆地理编码
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_AMAP_KEY;
      const regeoUrl = `https://restapi.amap.com/v3/geocode/regeo?output=json&location=${lon},${lat}&key=${apiKey}&radius=1000&extensions=all`;
      
      const response = await fetch(regeoUrl);
      const result = await response.json();
      
      if (result.status === '1' && result.regeocode) {
        const address = result.regeocode.formatted_address || "";
        return address;
      } else {
        return "";
      }
    } catch (error) {
      return "";
    }
  }, []);

  // 初始化高德地图API
  useEffect(() => {
    loadAmapAPI().catch((error) => {
      setMapError(error.message || '高德地图API加载失败');
    });
  }, [loadAmapAPI]);

  // 获取用户IP地理位置
  useEffect(() => {
    // 如果没有初始位置，尝试通过IP获取用户位置
    if (!initialLocation?.latitude || !initialLocation?.longitude) {
      getUserLocationByIP().then(location => {
        if (location) {
          setUserLocation(location);
        }
      });
    }
  }, [initialLocation?.latitude, initialLocation?.longitude, getUserLocationByIP]);

  // 更新高德地图标记
  const updateMarker = useCallback((map: any, lnglat: [number, number]) => {
    if (!window.AMap) return;
    
    // 移除旧标记
    if (markerRef.current) {
      map.remove(markerRef.current);
    }
    
    // 创建新标记
    const marker = new window.AMap.Marker({
      position: lnglat,
      title: '选中位置'
    });
    map.add(marker);
    markerRef.current = marker;
    
    // 移动地图中心到标记位置
    map.setCenter(lnglat);
  }, []);

  // 初始化高德地图
  useEffect(() => {
    if (!mapContainerRef.current || !mapLoaded || !window.AMap) return;

    try {
      // 确定地图中心点
      let lon = 116.404; // 北京经纬度
      let lat = 39.915;
      
      if (initialLocation?.longitude && initialLocation?.latitude) {
        lon = parseFloat(initialLocation.longitude);
        lat = parseFloat(initialLocation.latitude);
      } else if (userLocation) {
        lon = userLocation.lon;
        lat = userLocation.lat;
      }

      const map = new window.AMap.Map(mapContainerRef.current, {
        center: [lon, lat],
        zoom: (initialLocation?.latitude && initialLocation?.longitude) || userLocation ? 15 : 11,
        mapStyle: 'amap://styles/normal',
        viewMode: '2D'
      });

      // 添加地图点击事件
      map.on('click', async (e: any) => {
        const lnglat = e.lnglat;
        const lon = lnglat.lng;
        const lat = lnglat.lat;
        
        updateMarker(map, [lon, lat]);
        
        let name = query || initialLocation?.locationName || "";
        const reverseName = await reverseGeocode(lat, lon);
        if (reverseName) {
          name = reverseName;
          setIsProgrammaticUpdate(true); // 标记为程序化更新
          setQuery(name);
        }
        
        const selected: SelectedLocation = {
          latitude: lat.toFixed(6),
          longitude: lon.toFixed(6),
          locationName: name,
        };
        onLocationChange?.(selected);
      });

      mapInstanceRef.current = map;

      // 如果初始位置存在，放置初始标记
      if (initialLocation?.latitude && initialLocation?.longitude) {
        updateMarker(map, [lon, lat]);
        // 若有初始名称，直接填入输入框
        if (initialLocation?.locationName) {
          setIsProgrammaticUpdate(true);
          setQuery(initialLocation.locationName);
        } else {
          // 无初始名称时，逆地理获取一次名称
          (async () => {
            const name = await reverseGeocode(lat, lon);
            if (name) {
              setIsProgrammaticUpdate(true);
              setQuery(name);
            }
          })();
        }
      }

    return () => {
      // 清理 map
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
    
    } catch (error) {
      // 地图初始化失败，静默处理
    }
  }, [mapLoaded, userLocation, initialLocation?.latitude, initialLocation?.longitude, reverseGeocode, onLocationChange, updateMarker]);

  // 监听表单传入的初始坐标变化（例如编辑页异步载入数据后）
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.AMap) return;
    const latStr = initialLocation?.latitude;
    const lonStr = initialLocation?.longitude;
    if (!latStr || !lonStr) return;
    const lon = parseFloat(lonStr);
    const lat = parseFloat(latStr);
    updateMarker(map, [lon, lat]);
    if (initialLocation?.locationName && initialLocation.locationName.trim().length > 0) {
      setIsProgrammaticUpdate(true);
      setQuery(initialLocation.locationName);
    } else {
      (async () => {
        const name = await reverseGeocode(lat, lon);
        if (name) {
          setIsProgrammaticUpdate(true);
          setQuery(name);
        }
      })();
    }
  }, [initialLocation?.latitude, initialLocation?.longitude, initialLocation?.locationName, reverseGeocode, updateMarker]);

  // 高德地图输入联想搜索
  useEffect(() => {
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    if (!query || query.trim().length < 1 || !mapLoaded || !window.AMap || isProgrammaticUpdate) {
      setSuggestions([]);
      if (isProgrammaticUpdate) {
        setIsProgrammaticUpdate(false); // 重置标志
      }
      return;
    }
    
    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        // 使用高德地图v3 REST API进行地点搜索
        const apiKey = process.env.NEXT_PUBLIC_AMAP_KEY;
        const searchUrl = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(query.trim())}&city=全国&offset=8&page=1&key=${apiKey}&extensions=all`;
        
        const response = await fetch(searchUrl);
        const result = await response.json();
        
        if (result.status === '1' && result.pois && result.pois.length > 0) {
          const suggestions: Suggestion[] = result.pois
            .filter((poi: any) => poi.location) // 只保留有坐标的结果
            .map((poi: any) => {
              const [lng, lat] = poi.location.split(',').map(Number);
              return {
                place_id: poi.id || `${lng},${lat}`,
                display_name: poi.name + (poi.adname ? ` - ${poi.adname}` : ''),
                lon: lng,
                lat: lat,
              };
            });
          setSuggestions(suggestions);
          setSelectedIndex(-1); // 重置选中索引
        } else {
          setSuggestions([]);
          setSelectedIndex(-1);
        }
      } catch (error) {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    }, 300); // 减少延迟，提高响应速度
    
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const handleSelectLocation = useCallback((loc: Suggestion) => {
    const lon = Number(loc.lon);
    const lat = Number(loc.lat);
    const name: string = loc.display_name || "";
    
    // 更新输入框内容
    setQuery(name);
    // 隐藏搜索建议
    setSuggestions([]);
    setSelectedIndex(-1);
    
    if (mapInstanceRef.current && window.AMap) {
      // 更新地图标记
      updateMarker(mapInstanceRef.current, [lon, lat]);
      
      // 设置地图中心并调整缩放级别
      mapInstanceRef.current.setZoomAndCenter(15, [lon, lat]);
      
      // 触发位置变化回调
      onLocationChange?.({
        latitude: lat.toFixed(6),
        longitude: lon.toFixed(6),
        locationName: name,
      });
      

    }
  }, [updateMarker, onLocationChange]);

  // 处理键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectLocation(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
    }
  }, [suggestions, selectedIndex, handleSelectLocation]);


  return (
    <div className="w-full">
      
      <div className="relative w-full">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1); // 重置选中索引
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // 延迟隐藏，以便点击建议项时能正常触发
            setTimeout(() => {
              setSuggestions([]);
              setSelectedIndex(-1);
            }, 150);
          }}
          placeholder="输入地址搜索位置..."
          className="w-full"
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-white shadow-lg">
            <div className="py-1">
              {suggestions.map((s: any, index: number) => (
                <button
                  key={s.place_id}
                  type="button"
                  onClick={() => handleSelectLocation(s)}
                  className={`flex items-center w-full px-4 py-3 text-left focus:outline-none transition-colors duration-150 ${
                    index === selectedIndex 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'hover:bg-blue-50'
                  }`}
                >
                  <div className="flex-shrink-0 w-4 h-4 mr-3">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {s.display_name.split(' - ')[0]}
                    </div>
                    {s.display_name.includes(' - ') && (
                      <div className="text-xs text-gray-500 truncate">
                        {s.display_name.split(' - ')[1]}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {mapError ? (
        <div className="mt-3 h-[400px] w-full rounded-md border bg-red-50 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">地图加载失败</div>
            <div className="text-red-500 text-sm mb-4">{mapError}</div>
            <div className="text-gray-600 text-xs">
              <p>可能的解决方案：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>检查高德地图API密钥是否正确</li>
                <li>确认域名已添加到高德地图开放平台白名单</li>
                <li>检查网络连接是否正常</li>
                <li>确认Web服务API已开启</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div 
          ref={mapContainerRef} 
          className="mt-3 h-[400px] w-full rounded-md border"
          style={{
            position: 'relative',
            overflow: 'hidden'
          }}
        />
      )}
    </div>
  );
};

export default LocationSelection;