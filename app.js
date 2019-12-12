// "use strict";
// Initialize Firebase
var config = {
  apiKey: "AIzaSyDuvnyCEyOiT42PqMrIe4GYx5Dg-FHv0Tw",
  authDomain: "train-time-75eb6.firebaseapp.com",
  databaseURL: "https://train-time-75eb6.firebaseio.com",
  projectId: "train-time-75eb6",
  storageBucket: "train-time-75eb6.appspot.com",
  messagingSenderId: "677879798054",
  appId: "1:677879798054:web:af95ebc4fc5ef9e8a209e7"
};
firebase.initializeApp(config);
var database = firebase.database();
//Object to store entire firebase database as JSON object
var firebaseDataObject = null;
//variable to store key of object to update.
var updateKey;
//variable to hold input values
var name;
var destination;
var time;
var frequency;
// setup of train object
function Train (name, destination, firstTrainTime, frequency)
{
  this.name = name;
  this.destination = destination;
  this.firstTrainTime = firstTrainTime;
  this.frequency = frequency;
}
$(document).ready(function ()
{
  $("#current-time").text(moment().format("MMM DD hh:mm A"));
  setInterval(function ()
  {
    $("#current-time").text(moment().format("MMM DD hh:mm A"));
    displayTrainSchedule();
  }, 60000);
  database.ref().on("value", function (data)
  {
    firebaseDataObject = data.val();
    displayTrainSchedule();
  },
    function (objectError)
    {
      console.log("error:" + objectError.code);
    });
});
$("#submit-btn").on("click", function (event)
{
  event.preventDefault();
  if (getInputValues()) {
    var firstTrainTime = firstTimeString(time);
    var newTrain = new Train(name, destination, firstTrainTime, frequency);
    database.ref().push(newTrain);
  }
});
// script to remove a train from schedule/
$(document).on("click", ".remove", function ()
{
  var con = confirm("Are you sure you want to remove train?");
  if (con == true) {
    var key = $(this).attr("key");
    database.ref().child(key).remove();
  }
});
//Script to update trains schedule/
$(document).on("click", ".update", function ()
{
  updateKey = $(this).attr("key");
  displayUpdate();
});
$("#close-btn").on("click", function (event)
{
  event.preventDefault();
  updateDone();
});
$("#update-btn").on("click", function (event)
{
  event.preventDefault();
  updateTrain();
});
//Script to add train/
$("#add-train-btn").on("click", function (event)
{
  event.preventDefault();
  $("#submit-btn").css("display", "initial");
  $("#add-panel").slideToggle();
});
// function for next arrival time/
function getNextArrival (time, frequency)
{
  var nextArrival = moment(time);
  while (nextArrival < moment()) {
    nextArrival.add(frequency, "minutes");
  }
  return nextArrival;
}
// Calculates and returns how many minutes away next train is.
function getMinutesAway (time)
{
  var minutesAway = Math.round(getNextArrival(time).diff(moment(), "minutes", true));
  return (minutesAway === 0) ? "Arrived" : minutesAway
}
//Gets trains data from database, then used data to displays train stats on screen.
function displayTrainSchedule ()
{
  $("#schedule").empty();
  if (firebaseDataObject !== null) {
    Object.keys(firebaseDataObject).forEach(function (key)
    {
      var name = firebaseDataObject[key].name;
      var destination = firebaseDataObject[key].destination;
      var firstTrainTime = firebaseDataObject[key].firstTrainTime;
      var frequency = firebaseDataObject[key].frequency;
      var nextArrival = getNextArrival(firstTrainTime, frequency);
      var minutesAway = getMinutesAway(nextArrival);
      var newTableRow = $("<tr>");
      newTableRow.append($("<td>").html(name));
      newTableRow.append($("<td>").html(destination));
      newTableRow.append($("<td>").html(frequency));
      newTableRow.append($("<td>").html(nextArrival.format("MMM DD hh:mm A")));
      newTableRow.append($("<td>").html(minutesAway));
      var newDiv = $("<div>") //$("<button>")
      newDiv.addClass("update");
      newDiv.attr(
        {
          "key": key,
          "data-toggle": "tooltip",
          "data-placement": "left",
          "title": "Update"
        });
      newDiv.html("<span class='far fa-edit'></span>");
      newTableRow.append($("<td>").html(newDiv));
      var newDiv = $("<div>") //$("<button>")
      newDiv.addClass("remove");
      newDiv.attr(
        {
          "key": key,
          "data-toggle": "tooltip",
          "data-placement": "left",
          "title": "Remove"
        });
      newDiv.html("<span class='fas fa-trash-alt'></span>");
      newTableRow.append($("<td>").html(newDiv));
      $("#schedule").append(newTableRow);
    });
  }
}
function firstTimeString (time)
{
  var currentDateString = moment().format("YYYY-MM-DD");
  return (currentDateString + "T" + time);
}
//Pads time if hour or minute is single digit (ex 9:25 becomes 09:25)
function pad (time)
{
  var array = time.split(":");
  array[0] = parseInt(array[0]); //HH
  array[1] = parseInt(array[1]); //MM
  if (array[0] < 10) {
    array[0] = '0' + array[0];
  }
  if (array[1] < 10) {
    array[1] = '0' + array[1];
  }
  return (array[0] + ":" + array[1]);
}
// checks if time entered is valid
function checkTime (time)
{
  var array = time.split(":");
  if ((isNaN(array[0])) || (isNaN(array[1]))) {
    return false;
  }
  array[0] = parseInt(array[0]);
  array[1] = parseInt(array[1]);
  return ((array[0] >= 0 && array[0] <= 23) && (array[1] >= 0 && array[1] <= 59)) ? true : false;
}
//Populates input fields with current train data to update.
function displayUpdate ()
{
  $("#add-panel").slideDown();
  $("#submit-btn").css("display", "none");
  $("#update-btn").css("display", "initial");
  $("#add-title").html("Update Train");
  $("#name").val(firebaseDataObject[updateKey].name);
  $("#destination").val(firebaseDataObject[updateKey].destination);
  $("#time").val(moment(firebaseDataObject[updateKey].firstTrainTime).format("HH:mm"));
  $("#frequency").val(firebaseDataObject[updateKey].frequency);
}
//Clears out values in input boxes
////Changes panel title to back to 'Add Train'.
function updateDone ()
{
  $("#name").val("");
  $("#destination").val("");
  $("#time").val("");
  $("#frequency").val("");
  $("#add-panel").slideUp();
  $("#add-title").html("Add Train");
  $("#submit-btn").css("display", "initial");
  $("#update-btn").css("display", "none");
}
//Updates train data to firebase.
function updateTrain ()
{
  if (getInputValues()) {
    var firstTrainTime = firstTimeString(time);
    var newTrain = new Train(name, destination, firstTrainTime, frequency);
    database.ref("/" + updateKey).update(newTrain);
    updateDone();
  }
}
// Gets input values from user on page and check for validity.
// If all values are valid, 'true' is returned; 'false' otherwise.
function getInputValues ()
{
  name = $("#name").val().trim();
  destination = $("#destination").val().trim();
  time = $("#time").val().trim().replace(/\s/g, ""); //uses regexp to remove all white space
  frequency = parseInt($("#frequency").val().trim());
  //Tests if 'Train Name' value is empty.
  if (name === "") {
    alert("Please Enter A Train Name");
    $("#name").val("").focus();
    return false;
  }
  //Tests if 'Destination' value is empty.
  else if (destination === "") {
    alert("Please Enter A Destination");
    $("#destination").val("").focus();
    return false;
  }
  else if (!checkTime(time)) {
    alert("Please Enter A Valid First Train Time! (HH:MM)");
    $("#time").val("").focus();
    return false;
  }
  else if (isNaN(frequency)) {
    alert("Please Enter A Frequency");
    $("#frequency").val("").focus();
    return false;
  }
  else {
    // assist with single digit time
    time = pad(time);
    //Clears out input box fields
    $("#name").val("");
    $("#destination").val("");
    $("#time").val("");
    $("#frequency").val("");
    return true;
  }
}
