//ADD A MENU ITEM
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('WantedRoster')
      .addItem('Refresh', 'menuItem5')
      .addToUi();
}

function menuItem5() {
  cronTasks();
}

//THE PRIMARY FUNCTION
function cronTasks() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = SpreadsheetApp.setActiveSheet(ss.getSheets()[0]);
  myHTML();
  
  var d = new Date();
  var n = d.getDate();
  var m = d.getMonth() + 1;
  var y = d.getFullYear();
  var h = d.getHours();
  var min = d.getMinutes();

  var sheetName = "data" + "-" + y + "-" + m + "-" + n + "-" + h + ":" + min;
  newSheet(sheetName);
  
  Utilities.sleep(15000);

  var data = sh.getDataRange().getValues();
  var sourceRows = sh.getDataRange().getNumRows();
  var sourceColumns = sh.getDataRange().getNumColumns();
  
  var sh2 = ss.getSheetByName(sheetName);
 
  sh2.getDataRange().offset(0, 0, sourceRows, sourceColumns).setValues(data);
  
}

//GRAB DATA FROM THE MOST WANTED ROSTER
function myHTML() {
  var cell01 = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet().getRange('A1');
  cell01.setValue('name');  
 
  var cell02 = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet().getRange('B1');
  cell02.setValue('warrant');  

  var cell03 = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet().getRange('C1');
  cell03.setValue('url');
  
  
  var cell = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet().getRange('A2');
  cell.setFormula('=importXml("http://www.hennepinsheriff.org/jail-warrants/most-wanted/list", "//h1[@class=\'heading-module\']")');  
 
  var cell2 = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet().getRange('B2');
  cell2.setFormula('=importXml("http://www.hennepinsheriff.org/jail-warrants/most-wanted/list", "//div[@class=\'module-grid\']//p")'); 

  var cell3 = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet().getRange('C2');
  cell3.setFormula('=ARRAYFORMULA("http://www.hennepinsheriff.org" & importXml("http://www.hennepinsheriff.org/jail-warrants/most-wanted/list", "//a[@class=\'btn-block--grey\']/@href"))'); 
  
}


//DATA CONVERSION AND CLEANING STUFF
function newSheet(name){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  yourNewSheet = ss.insertSheet();
  yourNewSheet.setName(name);
}

function removeEmptyRows(sh){
  var maxRows = sh.getMaxRows(); 
  var lastRow = sh.getLastRow();
  sh.deleteRows(lastRow+1, maxRows-lastRow);
}

function removeEmptyColumns(sh) {
  var maxColumns = sh.getMaxColumns(); 
  var lastColumn = sh.getLastColumn();
  sh.deleteColumns(lastColumn+1, maxColumns-lastColumn);
}

function readRows() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  for (var i = 0; i <= numRows - 1; i++) {
    var row = values[i];
    Logger.log(row);
  }
};


function ImportJSON(url, query, options) {
  return ImportJSONAdvanced(url, query, options, includeXPath_, defaultTransform_);
}

function ImportJSONAdvanced(url, query, options, includeFunc, transformFunc) {
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText());
  
  return parseJSONObject_(object, query, options, includeFunc, transformFunc);
}

function URLEncode(value) {
  return encodeURIComponent(value.toString());  
}

function parseJSONObject_(object, query, options, includeFunc, transformFunc) {
  var headers = new Array();
  var data    = new Array();
  
  if (query && !Array.isArray(query) && query.toString().indexOf(",") != -1) {
    query = query.toString().split(",");
  }
  
  if (options) {
    options = options.toString().split(",");
  }
    
  parseData_(headers, data, "", 1, object, query, options, includeFunc);
  parseHeaders_(headers, data);
  transformData_(data, options, transformFunc);
  
  return hasOption_(options, "noHeaders") ? (data.length > 1 ? data.slice(1) : new Array()) : data;
}

function parseData_(headers, data, path, rowIndex, value, query, options, includeFunc) {
  var dataInserted = false;
  
  if (isObject_(value)) {
    for (key in value) {
      if (parseData_(headers, data, path + "/" + key, rowIndex, value[key], query, options, includeFunc)) {
        dataInserted = true; 
      }
    }
  } else if (Array.isArray(value) && isObjectArray_(value)) {
    for (var i = 0; i < value.length; i++) {
      if (parseData_(headers, data, path, rowIndex, value[i], query, options, includeFunc)) {
        dataInserted = true;
        rowIndex++;
      }
    }
  } else if (!includeFunc || includeFunc(query, path, options)) {
    // Handle arrays containing only scalar values
    if (Array.isArray(value)) {
      value = value.join(); 
    }
    
    // Insert new row if one doesn't already exist
    if (!data[rowIndex]) {
      data[rowIndex] = new Array();
    }
    
    // Add a new header if one doesn't exist
    if (!headers[path] && headers[path] != 0) {
      headers[path] = Object.keys(headers).length;
    }
    
    // Insert the data
    data[rowIndex][headers[path]] = value;
    dataInserted = true;
  }
  
  return dataInserted;
}

function parseHeaders_(headers, data) {
  data[0] = new Array();

  for (key in headers) {
    data[0][headers[key]] = key;
  }
}

function transformData_(data, options, transformFunc) {
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++) {
      transformFunc(data, i, j, options);
    }
  }
}

function isObject_(test) {
  return Object.prototype.toString.call(test) === '[object Object]';
}

function isObjectArray_(test) {
  for (var i = 0; i < test.length; i++) {
    if (isObject_(test[i])) {
      return true; 
    }
  }  

  return false;
}

function includeXPath_(query, path, options) {
  if (!query) {
    return true; 
  } else if (Array.isArray(query)) {
    for (var i = 0; i < query.length; i++) {
      if (applyXPathRule_(query[i], path, options)) {
        return true; 
      }
    }  
  } else {
    return applyXPathRule_(query, path, options);
  }
  
  return false; 
};

function applyXPathRule_(rule, path, options) {
  return path.indexOf(rule) == 0; 
}

function defaultTransform_(data, row, column, options) {
  if (!data[row][column]) {
    if (row < 2 || hasOption_(options, "noInherit")) {
      data[row][column] = "";
    } else {
      data[row][column] = data[row-1][column];
    }
  } 

  if (!hasOption_(options, "rawHeaders") && row == 0) {
    if (column == 0 && data[row].length > 1) {
      removeCommonPrefixes_(data, row);  
    }
    
    data[row][column] = toTitleCase_(data[row][column].toString().replace(/[\/\_]/g, " "));
  }
  
  if (!hasOption_(options, "noTruncate") && data[row][column]) {
    data[row][column] = data[row][column].toString().substr(0, 256);
  }

  if (hasOption_(options, "debugLocation")) {
    data[row][column] = "[" + row + "," + column + "]" + data[row][column];
  }
}

function removeCommonPrefixes_(data, row) {
  var matchIndex = data[row][0].length;

  for (var i = 1; i < data[row].length; i++) {
    matchIndex = findEqualityEndpoint_(data[row][i-1], data[row][i], matchIndex);

    if (matchIndex == 0) {
      return;
    }
  }
  
  for (var i = 0; i < data[row].length; i++) {
    data[row][i] = data[row][i].substring(matchIndex, data[row][i].length);
  }
}

function findEqualityEndpoint_(string1, string2, stopAt) {
  if (!string1 || !string2) {
    return -1; 
  }
  
  var maxEndpoint = Math.min(stopAt, string1.length, string2.length);
  
  for (var i = 0; i < maxEndpoint; i++) {
    if (string1.charAt(i) != string2.charAt(i)) {
      return i;
    }
  }
  
  return maxEndpoint;
}
  
function toTitleCase_(text) {
  if (text == null) {
    return null;
  }
  
  return text.replace(/\w\S*/g, function(word) { return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase(); });
}

function hasOption_(options, option) {
  return options && options.indexOf(option) >= 0;
}

var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheetsCount = ss.getNumSheets();
var sheets = ss.getSheets();

function onOpen() { 
 // Try New Google Sheets method
  try{
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Spreadsheet Cleanup')
    .addItem('Show Sheets', 'showSheets')
    .addItem('Hide Sheets', 'hideSheets')
    .addItem('Delete Sheets', 'deleteSheets')
    .addItem('Copy Sheets', 'copySheets') 
    .addToUi(); 
  } 
 
  // Log the error
  catch (e){Logger.log(e)}
 
  // Use old Google Spreadsheet method
  finally{
    var items = [
      {name: 'Hide Sheets', functionName: 'hideSheets'},
      {name: 'Show Sheets', functionName: 'showSheets'},
      {name: 'Delete Sheets', functionName: 'deleteSheets'},
      {name: 'Copy Sheets', functionName: 'copySheets'},
    ];
   ss.addMenu('Spreadsheet Cleanup', items);
  }
}
 
function deleteSheets() {
  var deleteSheetsContaining = Browser.inputBox("Delete sheets with names containing:"); 
  if (sheetMatch(deleteSheetsContaining)){
    for (var i = 0; i < sheetsCount; i++){
      var sheet = sheets[i]; 
      var sheetName = sheet.getName();
      Logger.log(sheetName);
      if (sheetName.indexOf(deleteSheetsContaining.toString()) !== -1){
        Logger.log("DELETE!");
        ss.deleteSheet(sheet);
      }
    } 
  } else {
     noMatchAlert();
  }
}

function hideSheets() {
  var hideSheetsContaining = Browser.inputBox("Hide sheets with names containing:");
  if (sheetMatch(hideSheetsContaining)){
    for (var i = 0; i < sheetsCount; i++){
      var sheet = sheets[i]; 
      var sheetName = sheet.getName();
      Logger.log(sheetName); 
      if (sheetName.indexOf(hideSheetsContaining.toString()) !== -1){
        Logger.log("HIDE!");
        sheet.hideSheet();
      }
    }
  } else { 
    noMatchAlert();
  }
}

function showSheets() {
  var showSheetsContaining = Browser.inputBox("Show sheets with names containing:"); 
  if (sheetMatch(showSheetsContaining)){
    for (var i = 0; i < sheetsCount; i++){
      var sheet = sheets[i]; 
      var sheetName = sheet.getName();
      Logger.log(sheetName); 
      if (sheetName.indexOf(showSheetsContaining.toString()) !== -1){
        Logger.log("SHOW!");
        sheet.showSheet();
      }
    } 
  } else {
    noMatchAlert();
  }
}

function copySheets() {
  var copySheetsContaining = Browser.inputBox("Copy sheets with names containing:");
  var destinationId = Browser.inputBox("Enter the destination spreadsheet ID:");
  if (sheetMatch(copySheetsContaining)){
    for (var i = 0; i < sheetsCount; i++){
    var sheet = sheets[i]; 
    var sheetName = sheet.getName();
    Logger.log(sheetName); 
    if (sheetName.indexOf(copySheetsContaining.toString()) !== -1){
      Logger.log("COPY!");
      var destination = SpreadsheetApp.openById(destinationId);
      sheet.copyTo(destination);
    }
  }
   successAlert('copied')
  } else {
    noMatchAlert();
  }
}

// determine if any sheets match the user input
function sheetMatch(sheetMatch){
  for (var i = 0; i < sheetsCount; i++){
    var sheetName = sheets[i].getName(); 
    if (sheetName.indexOf(sheetMatch.toString()) !== -1){
      return true
    }
  }
  return false
}

// alert if no sheets matched the user input
function noMatchAlert() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
   'No Sheets Matched Your Input',
   "Try again and make sure you aren't using quotes.",
   ui.ButtonSet.OK);
}

// alert after succesful action (only used in copy)
function successAlert(action) {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
   'Success!',
   "You're sheets were " + action + " successfully.",
   ui.ButtonSet.OK);
}