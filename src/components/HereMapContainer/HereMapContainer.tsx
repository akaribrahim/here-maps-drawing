import React, { useEffect, useLayoutEffect, useState } from 'react';
import useCustomRef from '../helpers/useCustomRef';
import { MapObjects } from '../types';
import getHereScripts from './getHereScripts';
import mapControlStructure from './mapControlStructure';
import './HereMapContainer.css';
declare global {
  interface Window {
    H: any;
  }
}
window.H = window.H || {};
type MapContainerProps = {
  apiKey: string;
  useEvents?: boolean;
  useUi?: boolean;
  center?: object;
  zoom?: number;
  layerOptions?: object;
  containerStyles?: object;
  mapLanguage?: string;
  onSuccess?: Function;
  children?: Function;
  resizeOnWidthChange: Boolean;
};

const HereMapContainer = (props: MapContainerProps) => {
  const { ref: mapRef } = useCustomRef<HTMLDivElement>();
  const [mapObjects, setMapObjects] = useState<MapObjects>({
    map: null,
    behavior: null,
    ui: null,
    platform: null
  });
  useLayoutEffect(() => {
    getHereScripts(() => {
      if (!props.apiKey) return console.error('Please provide an apiKey as props.    (here-maps-drawing)');
      const { H } = window;
      const platform = new H.service.Platform({
        apiKey: props.apiKey
      });
      const defaultLayers = platform.createDefaultLayers({
        ...props.layerOptions
      });
      const map = new H.Map(mapRef.current, defaultLayers.raster.terrain.map, {
        center: props.center,
        zoom: props.zoom,
        pixelRatio: window.devicePixelRatio || 1
      });
      let behavior: any = 'You must set useEvents props to true.';
      if (props.useEvents) behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      let ui: any = 'You must set useUi props to true';
      if (props.useUi) {
        ui = H.ui.UI.createDefault(map, defaultLayers, props.mapLanguage);
        ui.removeControl('mapsettings');
        ui.removeControl('scalebar');
        const ms = new H.ui.MapSettingsControl(mapControlStructure(defaultLayers));
        ui.addControl('customUiControl', ms);
      }
      props.onSuccess && props.onSuccess({ map, behavior, ui, platform });
      setMapObjects({ map, behavior, ui, platform });
    });
  }, []);

  /* Resize with debounce */
  const handleResize = () => {
    if (mapObjects.map && props.resizeOnWidthChange) {
      mapObjects.map.getViewPort().resize();
    }
  };
  const debounce = (func: Function, timeout = 300) => {
    let timer: any;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  };
  const resizeDebounce = debounce(handleResize, 200);
  useEffect(() => {
    window.addEventListener('resize', resizeDebounce);

    return () => {
      window.removeEventListener('resize', resizeDebounce);
    };
  }, []);
  return (
    <div id="map-container" className="map-container" ref={mapRef} style={{ ...props.containerStyles }}>
      {props.children && mapObjects.map && props.children(mapObjects)}
    </div>
  );
};

HereMapContainer.defaultProps = {
  center: {
    lat: 41.03115,
    lng: 29.00214
  },
  zoom: 9,
  useEvents: true,
  useUi: true,
  rulerTool: null,
  layersOptions: {},
  containerStyles: {
    height: 500,
    width: '100%'
  },
  resizeOnWidthChange: true,
  mapLanguage: 'en-US',
  onSuccess: () => {}
};

export default HereMapContainer;
