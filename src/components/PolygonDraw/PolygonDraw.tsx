import React, { useState, useEffect, useMemo, useRef } from 'react';
import { rectangleSvg } from '../icons';
import hexToRgbA from '../helpers/hexToRGB';
import { HGroup, HLineString, HPoint } from '../types';
import './PolygonDraw.css';
import useCustomRef from '../helpers/useCustomRef';
type DrawingStyles = {
  firstIcon: string;
  icon: string;
  polylineStylesOnDraw: object;
  polygonStylesOnDraw: object;
  movingPolylineStyles: object;
  finalPolygonStyles: object;
};
interface PolygonDrawProps {
  map: any;
  isDrawingActive: boolean;
  drawingStyles?: DrawingStyles;
  color?: string;
  isResizable?: boolean;
  polygonObjects?: Array<HGroup>;
  onSuccess?: Function;
}
const defaultProps = {
  isDrawingActive: false,
  useShortcuts: true,
  onSuccess: () => {},
  onEdit: () => {},
  onPutCornerPoint: () => {},
  onShortcutCallback: () => {},
  drawingStyles: {
    firstIcon: rectangleSvg('#185CF7').trim(),
    icon: rectangleSvg().trim(),
    polylineStylesOnDraw: {
      lineWidth: 3,
      strokeColor: '#185CF7',
      lineJoin: 'round'
    },
    polygonStylesOnDraw: {
      lineWidth: 0,
      fillColor: 'rgba(24, 92, 247, 0.2)'
    },
    movingPolylineStyles: {
      lineWidth: 3,
      strokeColor: '#185CF7',
      lineJoin: 'round',
      lineDash: [4],
      lineDashOffset: 1
    },
    finalPolygonStyles: {
      lineWidth: 3,
      strokeColor: '#185CF7',
      lineJoin: 'round',
      fillColor: 'rgba(24, 92, 247, 0.2)'
    }
  },
  shortcuts: {
    header: 'Polygon Shortcuts',
    undo: {
      keyCode: 85,
      char: 'U'
    },
    merge: {
      keyCode: 77,
      char: 'M'
    },
    delete: {
      keyCode: 27,
      char: 'ESC'
    }
  },
  isResizable: false
};
const { H } = window;
const PolygonDraw = ({
  map,
  isDrawingActive,
  drawingStyles,
  color,
  isResizable,
  polygonObjects,
  onSuccess
}: PolygonDrawProps) => {
  if (!(map && H && Object.keys(H).length > 0)) {
    console.log('Map Object or H Object not found      (here-maps-drawing)');
    return <></>;
  }
  const verticeGroup = useRef<HGroup>(new H.map.Group()); // Vertices of polygon object, contains markers
  const drawnPolystrip = useRef<HLineString>(new H.geo.LineString()); // Every time a vertice added this will be updated and final polygon will be drawn with it.
  const movingPolystrip = useRef<HLineString>(new H.geo.LineString()); // First point will be last clicked point, second point will be updated on mouse move
  const movingPolyline = useRef<any>(); // On mouse move, a polyline that follow mouse move will created and updated smoothly
  const polylineOnDraw = useRef<any>();
  const polygonOnDraw = useRef<any>();
  const { ref: tooltipRef } = useCustomRef<HTMLSpanElement>();
  const [pointCount, setPointCount] = useState<number>(0);
  useEffect(() => {
    if (map && isDrawingActive) {
      map.addEventListener('pointerdown', handleClickOnMap);
      map.addEventListener('pointermove', handleMoveOnMap);
      window.addEventListener('mousemove', handleTooltipPosition);
      return () => {
        map.removeEventListener('pointermove', handleMoveOnMap);
        map.removeEventListener('pointerdown', handleClickOnMap);
        window.removeEventListener('mousemove', handleTooltipPosition);
      };
    }
  }, [map, isDrawingActive]);

  const currentPointCount = (): number => {
    return drawnPolystrip.current.getPointCount();
  };
  const handleClickOnMap = (event: any) => {
    // On drawing phase, whenever user clicks on map, a marker created...
    // ...and these markers will be vertices of final polygon.
    // Also they will be used to handle edit functionality.
    if (isDrawingActive) {
      setPointCount((state) => state + 1);
      // get clicked point coords, create a marker, add to verticeGroup.
      const screenPoint = map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
      drawnPolystrip.current.pushPoint(screenPoint);
      const marker = new H.map.Marker(screenPoint, {
        icon: new H.map.Icon(drawingStyles.icon)
      });
      verticeGroup.current.addObject(marker);

      // reset moving objects
      if (movingPolystrip.current.getPointCount() === 2) {
        movingPolystrip.current.removePoint(0);
        movingPolystrip.current.removePoint(1);
      }
      // add clicked point to moving strip
      movingPolystrip.current.insertPoint(0, screenPoint);

      if (currentPointCount() >= 3) {
        // With 3 point, a polygon can shown on map
        if (polygonOnDraw.current) {
          var geoPolygon = new H.geo.Polygon(drawnPolystrip.current);
          polygonOnDraw.current.setGeometry(geoPolygon);
        } else {
          polygonOnDraw.current = new H.map.Polygon(drawnPolystrip.current, {
            style: { ...drawingStyles.polygonStylesOnDraw, ...(color && { fillColor: hexToRgbA(color, 0.2) }) }
          });
          map.addObject(polygonOnDraw.current);
        }
      }
      if (currentPointCount() >= 2) {
        // With second point, a polyline will be drawn
        if (polylineOnDraw.current) {
          polylineOnDraw.current.setGeometry(drawnPolystrip.current);
        } else {
          polylineOnDraw.current = new H.map.Polyline(drawnPolystrip.current, {
            style: {
              ...drawingStyles.polylineStylesOnDraw,
              ...(color && {
                strokeColor: color
              })
            }
          });
          map.addObject(polylineOnDraw.current);
        }
      } else if (currentPointCount() === 1) {
        // On first point, set first point icon
        map.addObject(verticeGroup.current);
        marker.setIcon(new H.map.Icon(drawingStyles.firstIcon || drawingStyles.icon));
        marker.addEventListener('tap', () => handleComplete(false, verticeGroup.current));
      }
    }
  };
  const moveSmooth = (
    oldPoint: HPoint,
    newPoint: HPoint,
    latIncrease: number,
    lngIncrease: number,
    counter: number
  ) => {
    if (movingPolyline.current) {
      movingPolystrip.current.removePoint(1);
      movingPolystrip.current.pushPoint({ lat: oldPoint.lat + latIncrease, lng: oldPoint.lng + lngIncrease });
      movingPolyline.current.setGeometry(movingPolystrip.current);
      if (counter !== 5) {
        moveSmooth(
          { lat: oldPoint.lat + latIncrease, lng: oldPoint.lng + lngIncrease },
          newPoint,
          latIncrease,
          lngIncrease,
          counter + 1
        );
      }
    }
  };
  const handleMoveOnMap = (event: any) => {
    if (!(isDrawingActive && movingPolystrip.current.getPointCount() > 0)) return;
    // get pointer position as H.Point
    const newPoint: HPoint = map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
    if (movingPolyline.current) {
      // if polyline created, update with new point
      const oldPoint: HPoint = movingPolystrip.current.extractPoint(1);
      const latIncrease: number = -1 * ((oldPoint.lat - newPoint.lat) / 5);
      const lngIncrease: number = -1 * ((oldPoint.lng - newPoint.lng) / 5);
      requestAnimationFrame(() => moveSmooth(oldPoint, newPoint, latIncrease, lngIncrease, 1));
    } else {
      // create polyline
      movingPolystrip.current.pushPoint(newPoint);
      movingPolyline.current = new H.map.Polyline(movingPolystrip.current, {
        style: { ...drawingStyles.movingPolylineStyles, ...(color && { strokeColor: color }) },
        volatility: true
      });
      map.addObject(movingPolyline.current);
    }
  };
  const handleComplete = (fromShortcut: Boolean = false, group: HGroup) => {
    if (currentPointCount() >= 3) {
      const mainGroup: HGroup = isResizable
        ? console.log('asfas')
        : addStandartPolygon(drawnPolystrip.current, group, fromShortcut);

      setPointCount(0);
      map.removeObject(polygonOnDraw.current);
      map.removeObject(polylineOnDraw.current);
      map.removeObject(movingPolyline.current);
      map.removeObject(group);
      group.removeObjects(group.getObjects());

      polygonOnDraw.current = null;
      polylineOnDraw.current = null;
      drawnPolystrip.current = new H.geo.LineString();
      movingPolystrip.current = new H.geo.LineString();
      movingPolyline.current = null;

      onSuccess(mainGroup);
    }
  };
  const addStandartPolygon = (polystrip: HLineString, verticeGroup: HGroup, fromShortcut: Boolean = false) => {
    if (!fromShortcut) {
      polystrip.removePoint(0);
    }
    const finalPolygon = new H.map.Polygon(polystrip, {
      style: {
        ...drawingStyles.finalPolygonStyles,
        ...(color && { strokeColor: color, fillColor: hexToRgbA(color, 0.2) })
      }
    });
    const mainGroup = new H.map.Group({
      volatility: true, // mark the group as volatile for smooth dragging of all it's objects
      objects: [finalPolygon]
    });
    mainGroup.getPolygon = () => finalPolygon;
    map.addObject(mainGroup);
    return mainGroup;
  };
  const handleTooltipPosition = (e: any) => {
    var x = e.clientX,
      y = e.clientY;
    if (tooltipRef.current) {
      tooltipRef.current.style.top = y - 5 + 'px';
      tooltipRef.current.style.left = x + 20 + 'px';
    }
  };
  const getTooltipText = (): string => {
    if (pointCount === 0) return 'Click to start drawing shape';
    if (pointCount < 3) return 'Click to continue drawing shape';
    return 'Click first point to close this shape';
  };
  return (
    <div>
      <div className="action-box">
        <div className="action">A</div>
        <div className="sub-action">
          <div>B</div>
          <div>C</div>
        </div>
      </div>
      <span id="tooltip-span" className="tooltip-container" ref={tooltipRef}>
        {getTooltipText()}
      </span>
    </div>
  );
};
PolygonDraw.defaultProps = defaultProps;
export default PolygonDraw;
