"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const markerFeatureRef = useRef<Feature<Point> | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);

  const defaultCenter = useMemo(() => {
    // 中国大致经纬度中心: [104.1954, 35.8617]
    const fallbackLon = 104.1954;
    const fallbackLat = 35.8617;
    const lon = initialLocation?.longitude
      ? parseFloat(initialLocation.longitude)
      : fallbackLon;
    const lat = initialLocation?.latitude
      ? parseFloat(initialLocation.latitude)
      : fallbackLat;
    return fromLonLat([lon, lat]);
  }, [initialLocation?.longitude, initialLocation?.latitude]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new Map({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: defaultCenter,
        zoom: initialLocation?.latitude && initialLocation?.longitude ? 14 : 4,
      }),
    });

    map.on("singleclick", (evt) => {
      const [lon, lat] = toLonLat(evt.coordinate);
      updateMarker(map, evt.coordinate);
      (async () => {
        let name = query || initialLocation?.locationName || "";
        try {
          reverseAbortRef.current?.abort();
          reverseAbortRef.current = new AbortController();
          const reverseUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
          const res = await fetch(reverseUrl, { headers: { Accept: "application/json" }, signal: reverseAbortRef.current.signal });
          const data = await res.json();
          const feature: PhotonFeature | null = Array.isArray(data?.features) ? (data.features[0] as PhotonFeature) : null;
          if (feature) {
            const props = feature.properties || {};
            const parts = [
              props.name,
              props.street,
              props.city,
              props.state,
              props.country,
            ].filter(Boolean);
            name = parts.join(", ") || name;
            setQuery(name);
          }
        } catch (_) {
          // 忽略逆地理编码失败，使用现有 name
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
          try {
            const [lon, lat] = toLonLat(defaultCenter);
            reverseAbortRef.current?.abort();
            reverseAbortRef.current = new AbortController();
            const reverseUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
            const res = await fetch(reverseUrl, { headers: { Accept: "application/json" }, signal: reverseAbortRef.current.signal });
            const data = await res.json();
            const feature: PhotonFeature | null = Array.isArray(data?.features) ? (data.features[0] as PhotonFeature) : null;
            if (feature) {
              const props = feature.properties || {};
              const parts = [props.name, props.street, props.city, props.state, props.country].filter(Boolean);
              const name = parts.join(", ");
              if (name) setQuery(name);
            }
          } catch (_) {
            // 忽略失败
          }
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
  }, []);

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
        try {
          reverseAbortRef.current?.abort();
          reverseAbortRef.current = new AbortController();
          const reverseUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
          const res = await fetch(reverseUrl, { headers: { Accept: "application/json" }, signal: reverseAbortRef.current.signal });
          const data = await res.json();
          const feature: PhotonFeature | null = Array.isArray(data?.features) ? (data.features[0] as PhotonFeature) : null;
          if (feature) {
            const props = feature.properties || {};
            const parts = [props.name, props.street, props.city, props.state, props.country].filter(Boolean);
            const name = parts.join(", ");
            if (name) setQuery(name);
          }
        } catch (_) {
          // 忽略失败
        }
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