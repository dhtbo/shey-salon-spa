"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

type Suggestion = {
  place_id: string;
  display_name: string;
  lon: number;
  lat: number;
};

type SelectedLocation = {
  latitude: number;
  longitude: number;
  locationName: string;
};

type LocationSearchProps = {
  onLocationChange?: (loc: SelectedLocation | null) => void;
  placeholder?: string;
};

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationChange,
  placeholder = "Search for a location..."
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);
  const ipLocationAbortRef = useRef<AbortController | null>(null);
  const isSettingDefaultRef = useRef(false);
  const justSelectedRef = useRef(false);

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

  // 获取用户IP地理位置并设置默认位置（只在组件首次加载时执行）
  useEffect(() => {
    let isMounted = true;
    
    getUserLocationByIP().then(async location => {
      if (location && isMounted) {
        setUserLocation(location);
        // 获取地址名称并设置为默认搜索内容
        const address = await reverseGeocode(location.lat, location.lon);
        if (address && isMounted) {
          // 设置标志防止触发搜索
          isSettingDefaultRef.current = true;
          setIsProgrammaticUpdate(true);
          // 先清空建议列表
          setSuggestions([]);
          setSelectedIndex(-1);
          // 然后设置查询内容
          setQuery(address);
          // 通知父组件用户当前位置
          onLocationChange?.({
            latitude: location.lat,
            longitude: location.lon,
            locationName: address
          });
          // 延迟重置标志
          setTimeout(() => {
            if (isMounted) {
              isSettingDefaultRef.current = false;
            }
          }, 100);
        }
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, []); // 空依赖数组，只在组件首次加载时执行

  // 高德地图输入联想搜索
  useEffect(() => {
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    
    // 如果是程序化更新、正在设置默认地址或刚选择了地址，直接返回，不执行搜索
    if (isProgrammaticUpdate || isSettingDefaultRef.current || justSelectedRef.current) {
      if (isProgrammaticUpdate) {
        setIsProgrammaticUpdate(false);
      }
      return;
    }
    
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
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
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, [query, isProgrammaticUpdate]);

  const handleSelectLocation = useCallback((loc: Suggestion) => {
    const lon = Number(loc.lon);
    const lat = Number(loc.lat);
    const name: string = loc.display_name || "";
    
    // 设置选择标志，防止重复弹出
    justSelectedRef.current = true;
    
    // 设置程序化更新标志，防止触发搜索
    setIsProgrammaticUpdate(true);
    
    // 立即隐藏搜索建议
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // 更新输入框内容
    setQuery(name);
    
    // 触发位置变化回调
    onLocationChange?.({
      latitude: lat,
      longitude: lon,
      locationName: name,
    });
    
    // 短暂延迟后重置选择标志
    setTimeout(() => {
      justSelectedRef.current = false;
    }, 200);
  }, [onLocationChange]);

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

  const handleClearLocation = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedIndex(-1);
    onLocationChange?.(null);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            // 只有在非设置默认地址且非程序化更新时才处理用户输入
            if (!isSettingDefaultRef.current && !isProgrammaticUpdate) {
              setQuery(e.target.value);
              setSelectedIndex(-1); // 重置选中索引
            } else if (isProgrammaticUpdate) {
              // 如果是程序化更新，只更新query值，不触发搜索
              setQuery(e.target.value);
              setIsProgrammaticUpdate(false);
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // 延迟隐藏，以便点击建议项时能正常触发
            setTimeout(() => {
              // 只有在没有程序化更新且没有刚选择地址时才隐藏建议
              if (!isProgrammaticUpdate && !justSelectedRef.current) {
                setSuggestions([]);
                setSelectedIndex(-1);
              }
            }, 150);
          }}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
      
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
                  <MapPin className="w-4 h-4 text-gray-400" />
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
  );
};

export default LocationSearch;