import React from 'react';
import { HereMapContainer, PolygonDraw } from '../components';
import { MapObjects } from '../components/types';
import { hereApiKey } from './credentials';

export default {
  title: 'HereMaps/PolygonDraw',
  component: HereMapContainer
};

export const Polygon = () => (
  <HereMapContainer apiKey={hereApiKey}>
    {(mapObjects: MapObjects): JSX.Element => <PolygonDraw map={mapObjects.map} isDrawingActive />}
  </HereMapContainer>
);
