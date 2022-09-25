const loadjs = require('loadjs');
export const getHereScripts = (callback: () => void) =>
  loadjs(
    [
      'https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css',
      '//js.api.here.com/v3/3.1/mapsjs-ui.css',
      '//js.api.here.com/v3/3.1/mapsjs-core.js',
      '//js.api.here.com/v3/3.1/mapsjs-service.js',
      '//js.api.here.com/v3/3.1/mapsjs-ui.js',
      '//js.api.here.com/v3/3.1/mapsjs-mapevents.js',
      '//js.api.here.com/v3/3.1/mapsjs-clustering.js'
    ],
    {
      success: callback,
      async: false
    }
  );

export default getHereScripts;
