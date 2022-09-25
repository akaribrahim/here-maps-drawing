# Here-Maps-Drawing (NOT READY)

> Drawing components on Here Maps JS API

We can do simple operations using Here Maps Js API but it doesn't provide any drawing tools. The purpose of this library is to be able to draw shapes like polygons on Here Maps.

## Installation

```bash
npm install --save here-maps-drawing
```

## Usage

## Docs

**HereMapContainer**

> The library provides a map container, but it will not be required to use the drawing tools.

> With the onSuccess method, we can take the `map, platform, ui, behavior` objects and perform all the operations written in the HereMaps document.

|                     |                             Description                             |                  Default Value                  | isRequired |
| ------------------: | :-----------------------------------------------------------------: | :---------------------------------------------: | :--------: |
|              apiKey |                          HereMaps Api Key                           |                      null                       |   `Yes`    |
|              center |        Center coordinates to be given when the map is loaded        |        `{lat:41.03115 , lng: 29.00214}`         |     No     |
|                zoom |                    Zoom level when map is loaded                    |                        9                        |     No     |
|           useEvents |                             Use Events                              |                      true                       |     No     |
|               useUi |                               Use Ui                                |                      true                       |     No     |
|        layerOptions | `layerOptions` given to the `platform.createDefaultLayers` function |                       {}                        |     No     |
|     containerStyles |                    Style object of map container                    |         `{height: 500, width: '100%'}`          |     No     |
| resizeOnWidthChange |               Resize the map on `window.resize` event               |                      true                       |     No     |
|         mapLanguage |                            Map Language                             |                     'en-US'                     |     No     |
|           rulerTool |           Activate RulerTool, see examples and try it out           |                      true                       |     No     |
|     onFoundDistance |              Callback that returns RulerTool's results              | `({ panoramicDistance, routerDistance }) => {}` |     No     |
|           onSuccess |               Callback function returning map objects               |     `({map, platform, behavior, ui}) => {}`     |     No     |

**PolygonDraw**

> You can pass the map object to this component with the HereMapContainer component of this library or in a different way.

> With the onSuccess method, we can take the `map, platform, ui, behavior` objects and perform all the operations written in the HereMaps document.

|                    |                                     Description                                     |                  Default Value                  | isRequired |
| -----------------: | :---------------------------------------------------------------------------------: | :---------------------------------------------: | :--------: |
|                map |                                   Core Map Object                                   |                      null                       |   `Yes`    |
|     polygonObjects |           Polygon Objects on map. Saved with onSuccess or onEdit methods.           |                      null                       |   `Yes`    |
|    isDrawingActive |           State value that controls whether drawing mode is active or not           |                      false                      |   `Yes`    |
|       useShortcuts |                        Use keyboard shortcut to help drawing                        |                      true                       |     No     |
|      drawingStyles |          Styles for each step, see DrawingStyles section for more details           |     **See [DrawingStyles](#DrawingStyles)**     |     No     |
|          shortcuts |                                    shortcut keys                                    |              **See ShortcutKeys**               |     No     |
|        isResizable |                           Final polygon resizable or not                            |                      true                       |     No     |
|              color | Instead of messing with the whole style from scratch, just changing the color (HEX) |                      null                       |     No     |
|          onSuccess |                    Callback function, on polygon drawing finish                     |        `(finalPolygon, mainGroup) => {}`        |     No     |
|             onEdit |                        Callback function, on polygon edited                         | `(finalPolygon, polygonIndex, mainGroup) => {}` |     No     |
|   onPutCornerPoint |                       Callback function, on each corner point                       |         `({ currentPointCount }) => {}`         |     No     |
| onShortcutCallback |               Callback that returns information when using a shortcut               |            `({keyCode, char}) => {}`            |     No     |

## DrawingStyles

Default Values of `drawingStyles` as follows.

> Icons must be in the form that **H.map.Icon()** will accept

```js
drawingStyles: {
    firstIcon: rectangleSvg('#185CF7').trim(),
    icon: rectangleSvg().trim(),
    polylineStylesOnDraw: { // The line drawn around the polygon at the drawing stage
       lineWidth: 3,
       strokeColor: '#185CF7',
       lineJoin: 'round',
    },
    polygonStylesOnDraw: { // Polygon at the drawing stage
       lineWidth: 0,
       fillColor: 'rgba(24, 92, 247, 0.2)',
    },
    movingPolylineStyles: { // The line following mouse movements
       lineWidth: 3,
       strokeColor: '#185CF7',
       lineJoin: 'round',
       lineDash: [2],
       lineDashOffset: 1,
    },
    finalPolygonStyles: { // Polygon created in the final
       lineWidth: 3,
       strokeColor: '#185CF7',
       lineJoin: 'round',
       fillColor: 'rgba(24, 92, 247, 0.2)',
    },
}
```

_ShortcutKeys_

You can create shortcuts for three different events. Events only work during the polygon drawing phase, that is, when **isDrawingActive=true**.

It can be customized by changing the keyCode and char values in the format given below.

> Undo => Deletes the last point

> Merge => Completes the polygon by connecting it with the first point

> Delete => Deletes the polygon in the drawing phase.

```js
{
    header: 'Polygon Shortcuts',
    undo: {
       keyCode: 85,
       char: 'U',
    },
    merge: {
       keyCode: 77,
       char: 'M',
    },
    delete: {
       keyCode: 27,
       char: 'ESC',
    },
}
```

## License

MIT © [akaribrahim](https://github.com/akaribrahim)