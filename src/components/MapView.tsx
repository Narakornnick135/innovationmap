'use client';

import { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Innovation, CATEGORIES, PROVINCES } from '@/types';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const ACTIVE_PROVINCES = new Set(PROVINCES.map((p) => p.nameEn));

function getAllRings(geometry: GeoJSON.Geometry): number[][][] {
  if (geometry.type === 'Polygon') {
    return (geometry as GeoJSON.Polygon).coordinates;
  }
  if (geometry.type === 'MultiPolygon') {
    return (geometry as GeoJSON.MultiPolygon).coordinates.flat();
  }
  return [];
}

interface MapViewProps {
  innovations: Innovation[];
  activeCategory: string;
  selectedId: number | null;
  onSelectInnovation: (innovation: Innovation) => void;
  flyToTarget?: { center: [number, number]; zoom: number; pitch: number; key: number } | null;
}

export default function MapView({
  innovations,
  activeCategory,
  selectedId,
  onSelectInnovation,
  flyToTarget,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const labelMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const onSelectRef = useRef(onSelectInnovation);
  onSelectRef.current = onSelectInnovation;

  const filtered = useMemo(
    () =>
      activeCategory === 'all'
        ? innovations
        : innovations.filter((i) => i.cat === activeCategory),
    [innovations, activeCategory],
  );

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [99.3, 18.35],
      zoom: 6.3,
      pitch: 0,
      bearing: 0,
      antialias: true,
      maxPitch: 60,
      minZoom: 5,
      maxZoom: 18,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'bottom-right',
    );
    map.addControl(
      new mapboxgl.ScaleControl({ maxWidth: 150 }),
      'bottom-left',
    );

    map.on('load', () => {
      // Apply padding for sidebar (desktop only)
      if (window.innerWidth > 768) {
        map.easeTo({
          padding: { top: 0, bottom: 0, left: 400, right: 0 },
          duration: 0,
        });
      }

      // Add DEM source for 3D terrain
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });

      // Hide all built-in labels (we have our own Thai labels)
      map.getStyle().layers.forEach((layer) => {
        if (layer.type === 'symbol') {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });

      // Enable 3D terrain
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Sky atmosphere effect
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });

      // Load province GeoJSON
      fetch('/innovationmap/thailand-provinces.json')
        .then((res) => res.json())
        .then((geojson: GeoJSON.FeatureCollection) => {
          const activeFeatures = geojson.features.filter((f) =>
            ACTIVE_PROVINCES.has(f.properties?.name || ''),
          );

          // Punch holes for active provinces in a dark overlay
          const holes: number[][][] = [];
          activeFeatures.forEach((f) => {
            holes.push(...getAllRings(f.geometry));
          });

          const worldRing = [
            [-180, -90],
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90],
          ];

          // Dark mask over everything EXCEPT active provinces
          map.addSource('world-mask', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [worldRing, ...holes],
              },
            },
          });

          map.addLayer({
            id: 'world-mask-fill',
            type: 'fill',
            source: 'world-mask',
            paint: {
              'fill-color': '#1a1a2e',
              'fill-opacity': 0.35,
            },
          });

          // Active province borders (green like original)
          map.addSource('active-provinces', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: activeFeatures },
          });

          map.addLayer({
            id: 'active-border',
            type: 'line',
            source: 'active-provinces',
            paint: {
              'line-color': '#4ade80',
              'line-width': 2.5,
              'line-opacity': 0.8,
            },
          });

          // Province name labels (HTML markers for Thai text)
          labelMarkersRef.current.forEach((m) => m.remove());
          labelMarkersRef.current = [];

          PROVINCES.forEach((p) => {
            const el = document.createElement('div');
            el.className = 'province-label';
            el.textContent = p.name;
            el.style.cssText = `
              font-family: 'Kanit', 'Prompt', sans-serif;
              font-size: 14px;
              font-weight: 700;
              color: #1e293b;
              text-shadow: 0 0 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8), 1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9);
              white-space: nowrap;
              pointer-events: none;
              user-select: none;
            `;

            const marker = new mapboxgl.Marker({
              element: el,
              anchor: 'center',
            })
              .setLngLat(p.coord)
              .addTo(map);

            labelMarkersRef.current.push(marker);
          });
        });
    });

    mapRef.current = map;

    return () => {
      labelMarkersRef.current.forEach((m) => m.remove());
      labelMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when filtered innovations change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filtered.forEach((item) => {
      const cat = CATEGORIES[item.cat] || { color: '#64748b', icon: '📌' };

      const el = document.createElement('div');
      el.className = 'innovation-marker';
      el.style.cssText =
        'width:28px;height:36px;cursor:pointer;transition:filter 0.2s ease;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));';
      el.innerHTML = `
        <svg viewBox="0 0 24 32" width="28" height="36" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${cat.color}"/>
          <circle cx="12" cy="11" r="5" fill="white" opacity="0.9"/>
        </svg>
      `;

      el.addEventListener('mouseenter', () => {
        el.style.filter =
          'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) brightness(1.15)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))';
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectRef.current(item);

        const isMobile = window.innerWidth <= 768;
        map.flyTo({
          center: [item.lng, item.lat],
          zoom: 14,
          pitch: 50,
          bearing: 0,
          speed: 1.2,
          padding: isMobile
            ? { top: 60, bottom: 0, left: 0, right: 0 }
            : {
                top: 0,
                bottom: 0,
                left: 400,
                right: Math.floor(window.innerWidth / 2),
              },
        });
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([item.lng, item.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [filtered]);

  // Fly to selected innovation (from sidebar click)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const item = innovations.find((i) => i.id === selectedId);
    if (item) {
      const isMobile = window.innerWidth <= 768;
      map.flyTo({
        center: [item.lng, item.lat],
        zoom: 14,
        pitch: 50,
        speed: 1.2,
        padding: isMobile
          ? { top: 60, bottom: 0, left: 0, right: 0 }
          : {
              top: 0,
              bottom: 0,
              left: 400,
              right: Math.floor(window.innerWidth / 2),
            },
      });
    }
  }, [selectedId, innovations]);

  // Fly to province target
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToTarget) return;

    map.flyTo({
      center: flyToTarget.center,
      zoom: flyToTarget.zoom,
      pitch: flyToTarget.pitch,
      bearing: Math.random() * 40 - 20,
      speed: 1.2,
      curve: 1.5,
    });
  }, [flyToTarget]);

  return <div ref={containerRef} className="w-full h-full" />;
}
