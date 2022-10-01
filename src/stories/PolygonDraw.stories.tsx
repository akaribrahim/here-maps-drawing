import React from 'react';
import { defaultDrawingStyles, HereMapContainer, PolygonDraw } from '../components';
import { MapObjects } from '../components/types';
import { hereApiKey } from './credentials';

export default {
  title: 'HereMaps/PolygonDraw',
  component: HereMapContainer
};

export const DefaultPolygonDraw = () => (
  <HereMapContainer apiKey={hereApiKey} containerStyles={{ height: 300 }}>
    {(mapObjects: MapObjects): JSX.Element => <PolygonDraw map={mapObjects.map} />}
  </HereMapContainer>
);

export const Color = () => (
  <HereMapContainer apiKey={hereApiKey} containerStyles={{ height: 300 }}>
    {(mapObjects: MapObjects): JSX.Element => <PolygonDraw map={mapObjects.map} color="#000" />}
  </HereMapContainer>
);

export const DrawingStyles = () => (
  <HereMapContainer apiKey={hereApiKey} containerStyles={{ height: 300 }}>
    {(mapObjects: MapObjects): JSX.Element => (
      <PolygonDraw
        map={mapObjects.map}
        drawingStyles={{
          ...defaultDrawingStyles,
          movingPolylineStyles: {
            // The line following mouse movements
            lineWidth: 5,
            strokeColor: '#47577b',
            lineJoin: 'round',
            lineDash: [2],
            lineDashOffset: 1
          }
        }}
      />
    )}
  </HereMapContainer>
);

export const OnPutCornerPoint = () => (
  <HereMapContainer apiKey={hereApiKey} containerStyles={{ height: 300 }}>
    {(mapObjects: MapObjects): JSX.Element => (
      <PolygonDraw map={mapObjects.map} onPutCornerPoint={(data: any) => console.log(data)} />
    )}
  </HereMapContainer>
);

export const UseShortcuts = () => (
  <HereMapContainer apiKey={hereApiKey} containerStyles={{ height: 300 }}>
    {(mapObjects: MapObjects): JSX.Element => <PolygonDraw map={mapObjects.map} useShortcuts={false} />}
  </HereMapContainer>
);

export const Shortcuts = () => (
  <HereMapContainer apiKey={hereApiKey} containerStyles={{ height: 300 }}>
    {(mapObjects: MapObjects): JSX.Element => (
      <PolygonDraw
        map={mapObjects.map}
        shortcuts={{
          undo: {
            keyCode: 66,
            char: 'B'
          },
          merge: {
            keyCode: 84,
            char: 'T'
          },
          cancel: {
            keyCode: 67,
            char: 'C'
          }
        }}
        onShortcutCallback={(data: any) => console.log(data)}
      />
    )}
  </HereMapContainer>
);
