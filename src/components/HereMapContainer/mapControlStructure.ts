export const mapControlStructure = (defaultLayers: any) => ({
  baseLayers: [
    {
      label: 'Normal Map',
      layer: defaultLayers.raster.normal.map
    },
    {
      label: 'Satellite Map',
      layer: defaultLayers.raster.satellite.map
    },
    {
      label: 'Terrain Map',
      layer: defaultLayers.raster.terrain.map
    }
  ],
  layers: [
    {
      label: 'layer.traffic',
      layer: defaultLayers.vector.normal.traffic
    },
    {
      label: 'layer.incidents',
      layer: defaultLayers.vector.normal.trafficincidents
    }
  ]
});

export default mapControlStructure;
