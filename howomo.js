/*
 * version 1.0.4
 *
 */

// fusion tables api: http://code.google.com/apis/fusiontables/docs/developers_guide.html#Querying


/* set variables
***********************************************************************/
num = 401562 //the table id
layer = new google.maps.FusionTablesLayer(num); //create a new FusionTablesLayer

now_showing_name = "All"; //variable to use for now showing; global so any function can set it
now_showing_location = ""; //variable part 2 to use for now showing; global so any function can set it


/* create the google map
***********************************************************************/
function initializeMap() {
  map = new google.maps.Map(document.getElementById('howomo-map'), {
    center: new google.maps.LatLng(38.94232097947902, -92.3291015625), //the center lat and long
    zoom: 8, //zoom
    mapTypeId: 'roadmap' //the map style
  });
  layer.setQuery("SELECT * FROM " + num); //set the initial query to Fusion Tables
  layer.setMap(map); //set the layer on to the map

  //on load, populate "Now showing" with "All"
  document.getElementById('howomo-nowshowing').innerHTML = "All";

  //clear out the "Name" section
  document.getElementById('howomo-listofhouses').innerHTML = "";
  
  //clear out the Google Maps link span
  document.getElementById('mapslink').innerHTML = "";
}



/* query the **helper table** for a list of all denominiations
/* the list is parsed in getData (below) for eventual placing in HTML
/* helper code: http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/gviz_sample.html
***********************************************************************/
function showDenominations() {
  //query the helper table for a list of all denominations
  var queryText = encodeURIComponent("SELECT 'Denomination' FROM 420855 {ORDER BY 'Denomination' {ASC}} ");
  var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + queryText);
  
  //send the resulting list to getData()
  query.send(getData);
}



/* parse through the data returned by showDenominations
/* format the data into the ul of denominations visible to the user
/* eventually use innerHTML to place the list on the page
/* for more information on the response object, see the documentation:
/* http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
***********************************************************************/
function getData(response) {

  // get the number of rows returned by showDenominations
  numRows = response.getDataTable().getNumberOfRows();

  //
  // concatenate the results into a menu for use in HTML
  //

  //open the menu
  //the fusiontabledata var will be what's put on the page via innerHTML
  fusiontabledata = "<select onchange=\"changeMapForDenominations(this.value); showNames(this.value);\">";
  // add a blank option by default
  // if someone selects it, the value of 'All' will cause the map to be
  // reset in changeMapForDenominations
  fusiontabledata += "<option value='All'>Choose...</option>";

  //for each row (ie. denomination) returned by the query in showDenominations
  for(i = 0; i < numRows; i++) {

    // place the value of the row (the denomination name) into a variable
    var denom = response.getDataTable().getValue(i, 0)

    // begin each option in the dropdown
    // put the escaped denom name as the value
    // this is used by the onchange function in <select>
    fusiontabledata += "<option value=\"" + denom + "\">";
    // then the name of the denom
    fusiontabledata += denom;
    // then close the option
    fusiontabledata += "</option>";
  }  
  // after all options are displayed, close the menu
  fusiontabledata += "</select>";

  //display the results on the page
  document.getElementById('howomo-listofdenominations').innerHTML = fusiontabledata;
}



/* query the table to show houses of only a particular denomination
/* this is called when the user clicks on a denomination name in the ul
***********************************************************************/
function changeMapForDenominations(selection) {
    // reset the map to the original, showing all denominations
    // this is to clear out any zoomed-in focus from clicking on houses
    initializeMap();
    // also clear out the span with the Google Maps link
    document.getElementById('mapslink').innerHTML = "";

    // if 'Choose' was selected, stop after resetting the map
    if (selection == 'All') {
        return;
    // otherwise, proceed normally
    } else { 
        //change the text in 'Now showing' to the selection before escaping quotes
        //first, change the global now_showing_name variable to the //selection
        now_showing_name = selection;
        //then place the global variable on the page
        document.getElementById('howomo-nowshowing').innerHTML = now_showing_name;

        // escape single quotes before querying table
        // via http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/change_query_text_input.html
        selection = selection.replace("'", "\\'");

        //query the table
        layer.setQuery("SELECT Location FROM " + num + " WHERE Denomination LIKE '" + selection + "'");
    }
}



/* query the fusion table for a list of all house names, cities, and locations in a denomination
/* the list is parsed in getNameData (below) for eventual placing in HTML
/* helper code: http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/gviz_sample.html
***********************************************************************/
function showNames(selection) {
    // escape single quotes before querying table
    // via http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/change_query_text_input.html
    selection = selection.replace("'", "\\'");
    var queryText = encodeURIComponent("SELECT 'Name', 'City', 'Location' FROM 401562 {WHERE 'Denomination' LIKE '" + selection + "' } {ORDER BY 'City' {ASC}} ");
    var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + queryText);
    query.send(getNameData);
    }



/* parse through the data returned by showNames
/* format the data into the ul of names visible to the user
/* eventually use innerHTML to place the list on the page
/* for more information on the response object, see the documentation:
/* http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
***********************************************************************/
function getNameData(response) {
    numRows = response.getDataTable().getNumberOfRows();
    numCols = response.getDataTable().getNumberOfColumns();

  // create a new variable of the current denomination, without spaces
  // this goes into the url in house names so they're not all '#20', // '#1', etc
  // replace spaces and apostrophes so the links aren't broken
  var now_showing_name_for_url = now_showing_name.replace(" ", "").replace(" ", "").replace(" ", "").replace("'", "");


  //
  // concatenate the results into a list
  // this largely mirrors the loops in getData (above)
  //

  //open the list
  fusiontabledata = "<ul>";
  //for each row returned by the query in showNames
  for(i = 0; i < numRows; i++) {
      // put each row in its own list item
      fusiontabledata += "<li>";
      // go through the first two columns (name and city)
      for (j = 0; j < 2; j++) {

        // variable to hold value of the cell
        var house = response.getDataTable().getValue(i, j)

        // detour to strip apostrophes
        house_escaped = house.split("'").join("\\\x27");

          //begin the list item
          //display the value of each row itself (this is the content of the li)
          // in this setup it will display church name, then city in
          // parentheticals

          // if this is the first column (name)
          if (j == 0) {
              // open an anchor and with the href being the name of
              // the denomination and the row number
              fusiontabledata += "<a href='#" + now_showing_name_for_url + i + "'";
              // add the changeMapForNames function to the anchor
              fusiontabledata += "onclick=\"changeMapForNames('" + house_escaped + "', '" + response.getDataTable().getValue(i, 1) + "', '" + response.getDataTable().getValue(i, 2) + "');\"";
              // close the anchor
              fusiontabledata += ">";
              // drop the name into the anchor
              fusiontabledata += response.getDataTable().getValue(i, j);
              // close and put in a new line
              fusiontabledata += "</a>";
          // otherwise, display normally but only if the second column
          // (city) isn't blank (i.e., it exists)
          } else {
              if (response.getDataTable().getValue(i, j) !== "") {
                  fusiontabledata += " (" + response.getDataTable().getValue(i, j) + ")<br>";
              }
          }
      }
      //close the link and the list item
      fusiontabledata += "</li>";
  }  
  // after all rows are displayed, close the list
  fusiontabledata += "</ul>";
  //display the results on the page
  document.getElementById('howomo-listofhouses').innerHTML = fusiontabledata;

    }



/* query the table to show only a particular house on the map (i.e., select by name)
/* this is called when the user clicks on a house name in the ul
***********************************************************************/
function changeMapForNames(selection, place, latlng) {
    //change the text in 'Now showing' to the denomination and name before escaping quotes
    //first, place the house name into the global variable
    now_showing_name = selection;
    now_showing_location = place;
    //then change 'now showing' on the page based on the variable
    document.getElementById('howomo-nowshowing').innerHTML = now_showing_name + " (" + place + ")";

    // escape single quotes before querying table
    // via http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/change_query_text_input.html
    selection = selection.replace("'", "\\'");

    // change the map to focus on the selected house
    // first, we need to transform the latlng argument passed down from
    // changeMapForNames from a string of numbers into two actual numbers
    var x = latlng.split(',');
    // next use parseFloat to put these into the LatLng to zoom to
    var y = new google.maps.LatLng(parseFloat(x[0]),parseFloat(x[1]));
    // then initialize a new map and replace the old one
    // (maybe make the map variable a global variable, make it a new
    // google.maps object, then fill in the details in initializeMap and
    // this function?)
    map = new google.maps.Map(document.getElementById('howomo-map'), {
      center: y, //the center lat and long
      zoom: 14, //zoom
      mapTypeId: 'roadmap' //the map style
     });
    // query the table to show the house the user clicked on
    layer.setQuery("SELECT Location FROM " + num + " WHERE Name LIKE '" + selection + "'");
    layer.setMap(map); //set the layer on to the map

    // send the name of the house to getHouseData for Maps link
    getHouseData(selection);
}



/* function to get address data for link to google maps
 * ********************************************************************/
function getHouseData(name) {
    // query the database for the address data of the house the user clicked on
    var queryText = encodeURIComponent("SELECT 'Address 1', 'Address 2', 'City', 'State', 'ZIP' FROM " + num + " WHERE Name LIKE '" + name + "'");
    var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + queryText);
    // send the address data to showHouseData
    query.send(showHouseData);

    function showHouseData(response) {
        // get the number of columns received from the database (should be 5)
        var cols = response.getDataTable().getNumberOfColumns();
        // open an empty housedata variable; the data from the DB will
        // go into this
        var housedata = "";
        // for each column (ie., address 1, city, etc.)
        for(i = 0; i < cols; i++){
            // add the data to the housedatavar
            housedata += response.getDataTable().getValue(0, i);
            // separate with a plus
            housedata += "+";
            }
        // replace spaces with pluses
        housedata = housedata.replace(" ", "+");
        // put housedata into variable for link to google maps
        mapslink = "<a target=\"_blank\" href=\"http://maps.google.com/maps?q=" + housedata + "\">visit Google Maps</a>";
        // put link to maps into the mapslink span on the page
        document.getElementById('mapslink').innerHTML = "To get directions or print a map of this location, " + mapslink + ".";
    }
}
