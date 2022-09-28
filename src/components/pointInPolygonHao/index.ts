import classifyPoint from 'robust-point-in-polygon';

const isPointInPolygon = (polygonCoordinates: any, point: any) => {
  return classifyPoint(polygonCoordinates, point) === -1 ? true : false;
};
export default isPointInPolygon;
