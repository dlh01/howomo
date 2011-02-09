/*
 * version 1.0
 * initial release
 *
 */

// fusion tables api: http://code.google.com/apis/fusiontables/docs/developers_guide.html#Querying


/* set variables
***********************************************************************/
num = 401562 //the table id
layer = new google.maps.FusionTablesLayer(num); //create a new FusionTablesLayer



/* create the google map
***********************************************************************/
function initializeMap() {
  map = new google.maps.Map(document.getElementById('howomo-map'), {
    center: new google.maps.LatLng(38.94232097947902, -92.3291015625), //the center lat and long
    zoom: 7, //zoom
    mapTypeId: 'roadmap' //the map style
  });
  layer.setQuery("SELECT * FROM " + num); //set the initial query to Fusion Tables
  layer.setMap(map); //set the layer on to the map

  //on load, populate "Now showing" with "All"
  document.getElementById('howomo-nowshowing').innerHTML = "All";
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
  // concatenate the results into a list for use in HTML
  //

  //open the list
  //the fusiontabledata var will be what's put on the page via innerHTML
  fusiontabledata = "<ul>";

  //for each row (ie. denomination) returned by the query in showDenominations
  for(i = 0; i < numRows; i++) {

    // place the value of the row (the denomination name) into a variable
    var denom = response.getDataTable().getValue(i, 0)

    // create a copy of that variable with escaped apostrophes
    denom_escaped = denom.split("'").join("\\\x27");

    // begin the list item; inside the link, include:
    // a link with the href being the number of the row (this is a dummy link)
    // a call to changeMapForDenominations with the argument being the value of the row
    // this will change the layer over the map to show just houses of that denomination 
    // a call to showNames with the argument being the value of the row
    // this will change the list under 'Names' to those of just that denomination
    fusiontabledata += "<li>";
    fusiontabledata += "<a href=\"#" + i + "\"";
    fusiontabledata += "onclick=\"changeMapForDenominations('" + denom_escaped + "');";
    fusiontabledata += "showNames('" + denom_escaped + "');\">";
    //display the value of the row itself (the denom name - this is the content of the li)
    fusiontabledata += denom + "";
    //close the link and the list item
    fusiontabledata += "</a></li>";
  }  
  // after all rows are displayed, close the list
  fusiontabledata += "</ul>";

  //display the results on the page
  document.getElementById('howomo-listofdenominations').innerHTML = fusiontabledata;
}



/* query the table to show houses of only a particular denomination
/* this is called when the user clicks on a denomination name in the ul
***********************************************************************/
function changeMapForDenominations(selection) {
    //change the text in 'Now showing' to the selection before escaping quotes
    document.getElementById('howomo-nowshowing').innerHTML = selection;

    // escape single quotes before querying table
    // via http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/change_query_text_input.html
    selection = selection.replace("'", "\\'");

    //query the table
    layer.setQuery("SELECT Location FROM " + num + " WHERE Denomination LIKE '" + selection + "'");
}



/* query the fusion table for a list of all house names in a denomination
/* the list is parsed in getNameData (below) for eventual placing in HTML
/* helper code: http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/gviz_sample.html
***********************************************************************/
function showNames(selection) {
    // escape single quotes before querying table
    // via http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/change_query_text_input.html
    selection = selection.replace("'", "\\'");
    var queryText = encodeURIComponent("SELECT 'Name', 'City' FROM 401562 {WHERE 'Denomination' LIKE '" + selection + "' } {ORDER BY 'City' {ASC}} ");
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
      // go through each column (name, city, etc;)
      for (j = 0; j < numCols; j++) {

        // variable to hold value of the row
        var house = response.getDataTable().getValue(i, j)

        // detour to strip apostrophes
        house_escaped = house.split("'").join("\\\x27");

          //begin the list item
          //display the value of each row itself (this is the content of the li)
          // in this setup it will display church name, new line, city

          // if this is the first column (name)
          if (j == 0) {
              // open an anchor and with the href being the row number
              fusiontabledata += "<a href='#" + i + "'";
              // add the showMapForNames function to the anchor
              fusiontabledata += "onclick=\"changeMapForNames('" + house_escaped + "');\"";
              // close the anchor
              fusiontabledata += ">";
              // drop the name into the anchor
              fusiontabledata += response.getDataTable().getValue(i, j);
              // close and put in a new line
              fusiontabledata += "</a><br>";
          // otherwise, display normally
          } else {
          fusiontabledata += response.getDataTable().getValue(i, j) + "<br>";
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
function changeMapForNames(selection) {
    //change the text in 'Now showing' to the denomination and name before escaping quotes
    document.getElementById('howomo-nowshowing').innerHTML = selection;

    // escape single quotes before querying table
    // via http://gmaps-samples.googlecode.com/svn/trunk/fusiontables/change_query_text_input.html
    selection = selection.replace("'", "\\'");

    // query the table
    layer.setQuery("SELECT Location FROM " + num + " WHERE Name LIKE '" + selection + "'");
}


