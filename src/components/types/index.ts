export interface HPoint {
  lat: number;
  lng: number;
}
export interface HLineString {
  pushPoint: Function;
  getPointCount: Function;
  extractPoint: Function;
  removePoint: Function;
  insertPoint: Function;
}
export interface HGroup {
  addObject: Function;
  removeObject: Function;
  getObjects: Function;
  removeObjects: Function;
}
export interface MapObjects {
  map: any;
  behavior: any;
  ui: any;
  platform: any;
}
