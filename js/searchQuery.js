var locator, map;

require([
  'esri/map', 'esri/tasks/locator',
  'esri/SpatialReference', 'esri/graphic',
  'esri/symbols/SimpleLineSymbol', 'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/Font', 'esri/symbols/TextSymbol',
  'esri/geometry/Point', 'esri/geometry/Extent',
  'esri/geometry/webMercatorUtils', 'esri/config',
  'esri/tasks/query', 'esri/tasks/QueryTask',
  'esri/dijit/Search',
  'dojo/_base/array', 'esri/Color', 'dojo/on',
  'dojo/number', 'dojo/parser', 'dojo/dom', 'dojo/json', 'dijit/registry',
  'dijit/form/Button', 'dijit/form/Textarea',
  'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
  'dojo/domReady!',
], function(
    Map, Locator,
    SpatialReference, Graphic,
    SimpleLineSymbol, SimpleMarkerSymbol,
    Font, TextSymbol,
    Point, Extent,
    webMercatorUtils, esriConfig,
    Query, QueryTask, Search,
    arrayUtils, Color, on,
    number, parser, dom, JSON, registry,
) {
  esriConfig.defaults.io.corsDetection = false;
  parser.parse();

  map = new Map('map', {
    basemap: 'topo',
    center: [-96.311, 43.676],
    zoom: 3,
  });
  locator = new Locator(
      'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer');

  var queryTask = new QueryTask(
      'https://services9.arcgis.com/cawhEgr1PU5y7dzp/arcgis/rest/services/Outage_Details/FeatureServer/7');

  // Returns 3 Fields based off location (set later in locator)
  var query = new Query();
  query.where = '1=1';
  query.returnGeometry = false;
  query.outFields = [
    'OUTTYPE', 'OUTSTART', 'OUTFINISH',
  ];


  var queryOutages = new Query();
  // Open items of any outage type.
  queryOutages.where = 'RESOLVDATE IS NULL';
  // Query for Open items and outage is Unplanned
  // queryOutages.where = 'RESOLVDATE IS NULL AND OUTTYPE = \'UNPLANNED\'';
  queryOutages.outFields = ['*'];
  queryOutages.returnGeometry = false;
  queryOutages.returnCountOnly = true;

  //Date Conversion
  function Unix_timestamp(t) {
    var dt = new Date(t).toLocaleDateString('en-US');
    var time = new Date(t * 1000).toLocaleTimeString('en-US');
    dt = (dt + ' ' + time);
    return dt;
  }

  function showResults(results) {
    var resultItems = [];
    var resultCount = results.features.length;

    for (var i = 0; i < resultCount; i++) {
      let featureAttributes = results.features[i].attributes;
      console.log('Result Count = ' + resultCount);
      console.log('Feature Attributes = ' + featureAttributes);

      console.log(featureAttributes.hasOwnProperty(featureAttributes));
      if (featureAttributes.hasOwnProperty(featureAttributes)) {
        break;
      }

      for (let attr in featureAttributes) {
        // Convert Date from Unix to Human Readable
        if (attr === 'OUTSTART') {
          featureAttributes.OUTSTART = Unix_timestamp(
              featureAttributes.OUTSTART);
        }
        if (attr === 'OUTFINISH') {
          featureAttributes.OUTFINISH = Unix_timestamp(
              featureAttributes.OUTFINISH);
        }

        resultItems.push(
            '<b>' + attr + ':</b>  ' + featureAttributes[attr] + '<br>');
      }
    }
    resultItems.push('<br>');
    dom.byId('info').innerHTML = resultItems.join('');
  }

  /*
        resultItems.push(
            '<b>' + attr + ':</b>  ' + featureAttributes[attr] + '<br>');
      }
    }
    resultItems.push('<br>');
    dom.byId('resultsdiv').innerHTML = resultItems.join('');



    /!*var rdiv = dom.byId('resultsdiv');
    rdiv.innerHTML = '<p><b>Results : ' + results.length + '</b></p>';

    var content = [];

 /!*   arrayUtils.forEach(results, function(result, index) {
      var x = result.location.x.toFixed(5);
      var y = result.location.y.toFixed(5);
      content.push('<fieldset>');
      content.push('<legend><b>' + (index + 1) + '. ' + result.address +
          '</b></legend>');
      content.push('<b>Type of outage:</b><br/>');
      content.push('<br/>');
      content.push('<i>Address Found In</i> : ' + result.);
      content.push('<i>Address Found In</i> : ' + result.address);


      content.push('<i>Address Found In</i> : ' + result.address);
      content.push('<br/><br/>');
      content.push('Geography: ' + JSON.stringify(result.location));
      content.push('&nbsp;&nbsp;');
      content.push('<br/><br/>');
      content.push('<b>Esri JSON</b><br/>');
      content.push('<b>WGS:</b> ' + JSON.stringify(result.location.toJson()));
      content.push('<br/>');
      content.push('</fieldset>');


    });*!/

    rdiv.innerHTML += content.join('');*!/
  }*/

  function locate() {
    var address = {
      SingleLine: dom.byId('address').value,
    };
    var options = {
      address: address,
      autoComplete: true,
      enableSuggestions: true,
      outFields: ['*'],
    };
    //optionally return the out fields if you need to calculate the extent of the geocoded point
    // if (locator.addressToLocations.hasOwnProperty(locator.addressToLocations[0])){

    if (locator.hasOwnProperty(address)) {
    eAddress.setAttribute("hidden", false);
    }
    else {
      locator.addressToLocations(options);
    }


  }

  //Perform the geocode. This function runs when the "Locate" button is pushed.
  document.getElementById('locate').onclick = locate;

//Draw and zoom to the result when the geocoding is complete
  locator.on('address-to-locations-complete', function(evt) {
    //if (!evt.addresses[0].location.hasOwnProperty(evt.addresses[0].location))
    if (!evt.addresses[0].location.hasOwnProperty(evt.addresses[0].location)) {
      // addresses[0].location.hasOwnProperty(evt.addresses[0].location);
      query.geometry = evt.addresses[0].location;
    }
    if (!query.geometry.hasOwnProperty(query.geometry)) {
      queryTask.execute(query, showResults);

    } else {
      dom.byId('address').value = 'Please enter a valid address';
    }
    //console.log(query.where + " " + query.geometry + " " + query.outFields + " " + query.returnGeometry + " " + query.text);

  });

//Current Outages Call
  queryTask.executeForCount(queryOutages, function(count) {
    dom.byId('output').innerHTML = count;
  }, function(error) {
    console.log(error);
  });

})
;





