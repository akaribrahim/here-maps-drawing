import React, { useState, useEffect, useMemo, useRef } from 'react';
import { rectangleSvg } from '../icons';
import hexToRgbA from '../helpers/hexToRGB';
import { HGroup, HLineString, HPoint } from '../types';
import './PolygonDraw.css';
import useCustomRef from '../helpers/useCustomRef';
import PolygonSvg from '../icons/mono-14-polygon.svg';

type DrawingStyles = {
  firstIcon: string;
  icon: string;
  polylineStylesOnDraw: object;
  polygonStylesOnDraw: object;
  movingPolylineStyles: object;
  finalPolygonStyles: object;
};
type Shortcut = {
  keyCode: number;
  char: string;
};
type ShortcutStruct = {
  undo: Shortcut;
  merge: Shortcut;
  cancel: Shortcut;
};
interface PolygonDrawProps {
  map: any;
  drawingStyles: DrawingStyles;
  color?: string;
  isResizable?: boolean;
  onSuccess?: Function;
  onPutCornerPoint?: Function;
  useShortcuts?: Boolean;
  shortcuts?: ShortcutStruct;
  onShortcutCallback?: Function;
}
const defaultProps = {
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
  useShortcuts: true,
  shortcuts: {
    undo: {
      keyCode: 85,
      char: 'U'
    },
    merge: {
      keyCode: 77,
      char: 'M'
    },
    cancel: {
      keyCode: 27,
      char: 'ESC'
    }
  }
};
const { H } = window;
const PolygonDraw = ({
  map,
  drawingStyles,
  color,
  isResizable,
  onSuccess,
  onPutCornerPoint,
  useShortcuts,
  shortcuts,
  onShortcutCallback
}: PolygonDrawProps) => {
  if (!(map && H && Object.keys(H).length > 0)) {
    console.log('Map Object or H Object not found      (here-maps-drawing)');
    return <></>;
  }
  const [polygonObjects, setPolygonObjects] = useState<Array<HGroup>>([]);
  const [isActionsOpen, setIsActionsOpen] = useState<Boolean>(false);
  const verticeGroup = useRef<HGroup>(new H.map.Group()); // Vertices of polygon object, contains markers
  const drawnPolystrip = useRef<HLineString>(new H.geo.LineString()); // Every time a vertice added this will be updated and final polygon will be drawn with it.
  const movingPolystrip = useRef<HLineString>(new H.geo.LineString()); // First point will be last clicked point, second point will be updated on mouse move
  const movingPolyline = useRef<any>(); // On mouse move, a polyline that follow mouse move will created and updated smoothly
  const polylineOnDraw = useRef<any>();
  const polygonOnDraw = useRef<any>();
  const { ref: tooltipRef } = useCustomRef<HTMLSpanElement>();
  const [pointCount, setPointCount] = useState<number>(0);
  useEffect(() => {
    if (map && isActionsOpen) {
      map.addEventListener('pointerdown', handleClickOnMap);
      map.addEventListener('pointermove', handleMoveOnMap);
      document.addEventListener('keydown', handleKeydown);
      window.addEventListener('mousemove', handleTooltipPosition);
      return () => {
        map.removeEventListener('pointermove', handleMoveOnMap);
        document.removeEventListener('keydown', handleKeydown);
        map.removeEventListener('pointerdown', handleClickOnMap);
        window.removeEventListener('mousemove', handleTooltipPosition);
      };
    }
  }, [map, isActionsOpen]);

  const currentPointCount = (): number => {
    return drawnPolystrip.current.getPointCount();
  };
  const handleClickOnMap = (event: any) => {
    // On drawing phase, whenever user clicks on map, a marker created...
    // ...and these markers will be vertices of final polygon.
    // Also they will be used to handle edit functionality.
    if (isActionsOpen) {
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
        marker.addEventListener('tap', () => handleComplete(false));
      }
      onPutCornerPoint && onPutCornerPoint({ currentPointCount: polystrip.getPointCount() });
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
    if (!(isActionsOpen && movingPolystrip.current.getPointCount() > 0)) return;
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
  const handleComplete = (fromShortcut: Boolean = false) => {
    if (currentPointCount() >= 3) {
      const mainGroup: HGroup = isResizable
        ? console.log('asfas')
        : addStandartPolygon(drawnPolystrip.current, fromShortcut);

      handleEscape();

      setPolygonObjects((state) => [...state, mainGroup]);
      onSuccess && onSuccess(mainGroup);
    }
  };
  const addStandartPolygon = (polystrip: HLineString, fromShortcut: Boolean = false) => {
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
  const handleKeydown = (e: any) => {
    // U: 85 C: 67 M: 77 ESC: 27
    if (useShortcuts && shortcuts) {
      if (e.keyCode === shortcuts.undo.keyCode) {
        // removeLastPoint
        onShortcutCallback && onShortcutCallback({ keyCode: shortcuts.undo.keyCode, char: shortcuts.undo.char });
        handleUndo();
      } else if (e.keyCode === shortcuts.merge.keyCode) {
        onShortcutCallback && onShortcutCallback({ keyCode: shortcuts.merge.keyCode, char: shortcuts.merge.char });
        handleComplete(true);
      } else if (e.keyCode === shortcuts.cancel.keyCode) {
        onShortcutCallback && onShortcutCallback({ keyCode: shortcuts.cancel.keyCode, char: shortcuts.cancel.char });
        handleEscape();
      }
    }
  };
  const handleEscape = () => {
    setIsActionsOpen(false);
    setPointCount(0);
    map.removeObject(polygonOnDraw.current);
    map.removeObject(polylineOnDraw.current);
    map.removeObject(movingPolyline.current);
    map.removeObject(verticeGroup.current);
    verticeGroup.current.removeObjects(verticeGroup.current.getObjects());

    polygonOnDraw.current = null;
    polylineOnDraw.current = null;
    drawnPolystrip.current = new H.geo.LineString();
    movingPolystrip.current = new H.geo.LineString();
    movingPolyline.current = null;
  };
  const handleUndo = () => {
    if (currentPointCount() > 2) {
      setPointCount((state) => state - 1);
      drawnPolystrip.current.removePoint(drawnPolystrip.current.getPointCount() - 1);
      const a = drawnPolystrip.current.extractPoint(drawnPolystrip.current.getPointCount() - 1);
      var geoPolygon = new H.geo.Polygon(drawnPolystrip.current);
      polygonOnDraw.current.setGeometry(geoPolygon);
      polylineOnDraw.current.setGeometry(drawnPolystrip.current);
      movingPolystrip.current.insertPoint(0, a);
      movingPolystrip.current.removePoint(1);
      movingPolyline.current.setGeometry(movingPolystrip.current);
      verticeGroup.current.removeObject(
        verticeGroup.current.getObjects()[verticeGroup.current.getObjects().length - 1]
      );
    }
  };
  return (
    <div>
      <div className="action-box">
        <div className="action" onClick={() => setIsActionsOpen(true)}>
          <img src={PolygonSvg} height={20} width={20} />
        </div>
        <div className={`sub-action ${isActionsOpen ? 'open' : ''}`}>
          <div onClick={() => handleComplete(true)} className={pointCount >= 3 ? '' : 'disabled'}>
            Close Shape {useShortcuts && <span className="shortcut">({shortcuts?.merge.char})</span>}
          </div>
          <div className="divider" />
          <div onClick={handleUndo} className={pointCount > 2 ? '' : 'disabled'}>
            Delete Last Point {useShortcuts && <span className="shortcut">({shortcuts?.undo.char})</span>}
          </div>
          <div className="divider" />
          <div onClick={handleEscape}>
            Cancel {useShortcuts && <span className="shortcut">({shortcuts?.cancel.char})</span>}
          </div>
        </div>
      </div>
      {isActionsOpen && (
        <span id="tooltip-span" className="tooltip-container" ref={tooltipRef}>
          {getTooltipText()}
        </span>
      )}
      Poligon Sayısı {polygonObjects.length}
    </div>
  );
};
PolygonDraw.defaultProps = defaultProps;
export default PolygonDraw;
