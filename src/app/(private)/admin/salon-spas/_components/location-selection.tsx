"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import { Icon, Style } from "ol/style";
import { Input } from "@/components/ui/input";

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, any>;
};

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
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const markerFeatureRef = useRef<Feature<Point> | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);
  const ipLocationAbortRef = useRef<AbortController | null>(null);

  // 获取用户IP地理位置
  const getUserLocationByIP = useCallback(async (): Promise<{lat: number, lon: number} | null> => {
    try {
      ipLocationAbortRef.current?.abort();
      ipLocationAbortRef.current = new AbortController();
      const response = await fetch('https://ipapi.co/json/', {
        signal: ipLocationAbortRef.current.signal
      });
      const data = await response.json();
      if (data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude)
        };
      }
    } catch (_) {
      // 忽略IP定位失败
    }
    return null;
  }, []);

  // 提取重复的逆地理编码逻辑
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      reverseAbortRef.current?.abort();
      reverseAbortRef.current = new AbortController();
      const reverseUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
      const res = await fetch(reverseUrl, { 
        headers: { Accept: "application/json" }, 
        signal: reverseAbortRef.current.signal 
      });
      const data = await res.json();
      const feature: PhotonFeature | null = Array.isArray(data?.features) 
        ? (data.features[0] as PhotonFeature) 
        : null;
      if (feature) {
        const props = feature.properties || {};
        const parts = [
          props.name,
          props.street,
          props.city,
          props.state,
          props.country,
        ].filter(Boolean);
        return parts.join(", ");
      }
    } catch (_) {
      // 忽略逆地理编码失败
    }
    return "";
  }, []);

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

  const defaultCenter = useMemo(() => {
    // 优先级：初始位置 > IP位置 > 中国大致经纬度中心
    let lon = 104.1954; // 中国大致经纬度中心
    let lat = 35.8617;
    
    if (initialLocation?.longitude && initialLocation?.latitude) {
      // 使用传入的初始位置
      lon = parseFloat(initialLocation.longitude);
      lat = parseFloat(initialLocation.latitude);
    } else if (userLocation) {
      // 使用IP定位获取的位置
      lon = userLocation.lon;
      lat = userLocation.lat;
    }
    
    return fromLonLat([lon, lat]);
  }, [initialLocation?.longitude, initialLocation?.latitude, userLocation]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new Map({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.de/{z}/{x}/{y}.png',
            crossOrigin: 'anonymous'
          }),
        }),
      ],
      view: new View({
        center: defaultCenter,
        zoom: (initialLocation?.latitude && initialLocation?.longitude) || userLocation ? 14 : 4,
      }),
    });

    map.on("singleclick", (evt) => {
      const [lon, lat] = toLonLat(evt.coordinate);
      updateMarker(map, evt.coordinate);
      (async () => {
        let name = query || initialLocation?.locationName || "";
        const reverseName = await reverseGeocode(lat, lon);
        if (reverseName) {
          name = reverseName;
          setQuery(name);
        }
        const selected: SelectedLocation = {
          latitude: lat.toFixed(6),
          longitude: lon.toFixed(6),
          locationName: name,
        };
        onLocationChange?.(selected);
      })();
    });

    mapInstanceRef.current = map;

    // 如果初始位置存在，放置初始标记
    if (initialLocation?.latitude && initialLocation?.longitude) {
      updateMarker(map, defaultCenter);
      // 若有初始名称，直接填入输入框
      if (initialLocation?.locationName) {
        setQuery(initialLocation.locationName);
      } else {
        // 无初始名称时，逆地理获取一次名称
        (async () => {
          const [lon, lat] = toLonLat(defaultCenter);
          const name = await reverseGeocode(lat, lon);
          if (name) setQuery(name);
        })();
      }
    }

    return () => {
      // 清理 map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCenter, userLocation]);

  // 监听表单传入的初始坐标变化（例如编辑页异步载入数据后）
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const latStr = initialLocation?.latitude;
    const lonStr = initialLocation?.longitude;
    if (!latStr || !lonStr) return;
    const lon = parseFloat(lonStr);
    const lat = parseFloat(latStr);
    const coordinate = fromLonLat([lon, lat]);
    updateMarker(map, coordinate);
    if (initialLocation?.locationName && initialLocation.locationName.trim().length > 0) {
      setQuery(initialLocation.locationName);
    } else {
      (async () => {
        const name = await reverseGeocode(lat, lon);
        if (name) setQuery(name);
      })();
    }
  }, [initialLocation?.latitude, initialLocation?.longitude, initialLocation?.locationName]);

  useEffect(() => {
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        const url = `https://photon.komoot.io/api/?limit=8&q=${encodeURIComponent(query.trim())}`;
        searchAbortRef.current?.abort();
        searchAbortRef.current = new AbortController();
        const res = await fetch(url, { headers: { Accept: "application/json" }, signal: searchAbortRef.current.signal });
        const data = await res.json();
        const mapped = Array.isArray(data?.features)
          ? (data.features as PhotonFeature[]).map((f) => {
              const lon = f?.geometry?.coordinates?.[0] as number;
              const lat = f?.geometry?.coordinates?.[1] as number;
              const props = f?.properties || {};
              const parts = [props.name, props.street, props.city, props.state, props.country].filter(Boolean);
              return {
                place_id: (props.osm_id as string) || `${lon},${lat}`,
                display_name: (parts.join(", ") as string) || `${lat}, ${lon}`,
                lon,
                lat,
              } as Suggestion;
            })
          : [];
        setSuggestions(mapped);
      } catch (e) {
        setSuggestions([]);
      }
    }, 400);
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const updateMarker = useCallback((map: Map, coordinate: number[]) => {
    if (!vectorSourceRef.current) {
      vectorSourceRef.current = new VectorSource();
      const layer = new VectorLayer({ source: vectorSourceRef.current });
      markerLayerRef.current = layer;
      map.addLayer(layer);
    }
    if (!markerFeatureRef.current) {
      markerFeatureRef.current = new Feature({ geometry: new Point(coordinate) });
      markerFeatureRef.current.setStyle(
        new Style({
          image: new Icon({ anchor: [0.5, 1], src: "https://openlayers.org/en/latest/examples/data/icon.png" }),
        })
      );
      vectorSourceRef.current.addFeature(markerFeatureRef.current);
    } else {
      const geom = markerFeatureRef.current.getGeometry();
      if (geom) geom.setCoordinates(coordinate);
    }
    map.getView().animate({ center: coordinate, zoom: 15, duration: 300 });
  }, []);

  const handleSelectLocation = useCallback((loc: Suggestion) => {
    const lon = Number(loc.lon);
    const lat = Number(loc.lat);
    const coordinate = fromLonLat([lon, lat]);
    const name: string = loc.display_name || "";
    setQuery(name);
    setSuggestions([]);
    if (mapInstanceRef.current) {
      updateMarker(mapInstanceRef.current, coordinate);
      onLocationChange?.({
        latitude: lat.toFixed(6),
        longitude: lon.toFixed(6),
        locationName: name,
      });
    }
  }, [onLocationChange]);

  return (
    <div className="w-full">
      <div className="relative w-full">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-white text-sm shadow">
            {suggestions.map((s: any) => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => handleSelectLocation(s)}
                className="block w-full cursor-pointer px-3 py-2 text-left hover:bg-gray-100"
              >
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={mapContainerRef} className="mt-3 h-[400px] w-full rounded-md border" />
    </div>
  );
};

export default LocationSelection;