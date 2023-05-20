
//firebase configuration object
var config = {
  apiKey: "AIzaSyDuvnyCEyOiT42PqMrIe4GYx5Dg-FHv0Tw",
  authDomain: "train-time-75eb6.firebaseapp.com",
  databaseURL: "https://train-time-75eb6.firebaseio.com",
  projectId: "train-time-75eb6",
  storageBucket: "train-time-75eb6.appspot.com",
  messagingSenderId: "677879798054",
  appId: "1:677879798054:web:af95ebc4fc5ef9e8a209e7"
};
// Initialize Firebase with the configuration
firebase.initializeApp(config);
var database = firebase.database();

var firebaseDataObject = null;
var updateKey;
var name;
var destination;
var time;
var frequency;

function Train(name, destination, firstTrainTime, frequency) {
  // Train object constructor
  this.name = name;
  this.destination = destination;
  this.firstTrainTime = firstTrainTime;
  this.frequency = frequency;
}

$(document).ready(function () {
  // Execute when the document is ready
  $("#current-time").text(moment().format("MMM DD HH:mm A"));

  setInterval(function () {
    // Update current time every minute
    $("#current-time").text(moment().format("MMM DD HH:mm A"));
    displayTrainSchedule();
  }, 60000);

  // Listen for changes in the database
  database.ref().on("value", function (data) {
    firebaseDataObject = data.val();
    displayTrainSchedule();
  },
  function (objectError) {
    console.log("error:" + objectError.code);
  });
});

$("#submit-btn").on("click", function (event) {
  // Submit button click event handler
  event.preventDefault();
  if (getInputValues()) {
    var firstTrainTime = firstTimeString(time);
    var newTrain = new Train(name, destination, firstTrainTime, frequency);
    database.ref().push(newTrain);
  }
});

$(document).on("click", ".remove", function () {
  // Remove button click event handler
  var con = confirm("Are you sure you want to remove train?");
  if (con == true) {
    var key = $(this).attr("key");
    database.ref().child(key).remove();
  }
});

$(document).on("click", ".update", function () {
  // Update button click event handler
  updateKey = $(this).attr("key");
  displayUpdate();
});

$("#close-btn").on("click", function (event) {
  // Close button click event handler
  event.preventDefault();
  updateDone();
});

$("#update-btn").on("click", function (event) {
  // Update button click event handler
  event.preventDefault();
  updateTrain();
});

$("#add-train-btn").on("click", function (event) {
  // Add train button click event handler
  event.preventDefault();
  $("#submit-btn").css("display", "initial");
  $("#add-panel").slideToggle();
});

function getNextArrival(time, frequency) {
  // Calculate and return the next arrival time
  var nextArrival = moment(time);
  while (nextArrival < moment()) {
    nextArrival.add(frequency, "minutes");
  }
  return nextArrival;
}

function getMinutesAway(time) {
  // Calculate and return how many minutes away the next train is
  var minutesAway = Math.round(getNextArrival(time).diff(moment(), "minutes", true));
  return (minutesAway === 0) ? "Arrived" : minutesAway;
}

function displayTrainSchedule() {
  // Display the train schedule based on data from the database
  $("#schedule").empty();
  if (firebaseDataObject !== null) {
    Object.keys(firebaseDataObject).forEach(function (key) {
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

function firstTimeString(time) {
  // Format the time string to include the current date
  var currentDateString = moment().format("YYYY-MM-DD");
  return (currentDateString + "T" + time);
}

function pad(time) {
  // Pad the hour and minute with leading zeros if necessary
  var array = time.split(":");
  array[0] = parseInt(array[0]); // HH
  array[1] = parseInt(array[1]); // MM
  if (array[0] < 10) {
    array[0] = '0' + array[0];
  }
  if (array[1] < 10) {
    array[1] = '0' + array[1];
  }
  return (array[0] + ":" + array[1]);
}

function checkTime(time) {
  // Check if the entered time is valid
  var array = time.split(":");
  if ((isNaN(array[0])) || (isNaN(array[1]))) {
    return false;
  }
  array[0] = parseInt(array[0]);
  array[1] = parseInt(array[1]);
  return ((array[0] >= 0 && array[0] <= 23) && (array[1] >= 0 && array[1] <= 59)) ? true : false;
}

function displayUpdate() {
  // Display the update panel with current train data
  $("#add-panel").slideDown();
  $("#submit-btn").css("display", "none");
  $("#update-btn").css("display", "initial");
  $("#add-title").html("Update Train");
  $("#name").val(firebaseDataObject[updateKey].name);
  $("#destination").val(firebaseDataObject[updateKey].destination);
  $("#time").val(moment(firebaseDataObject[updateKey].firstTrainTime).format("HH:mm"));
  $("#frequency").val(firebaseDataObject[updateKey].frequency);
}

function updateDone() {
  // Clear the input fields and reset the panel title
  $("#name").val("");
  $("#destination").val("");
  $("#time").val("");
  $("#frequency").val("");
  $("#add-panel").slideUp();
  $("#add-title").html("Add Train");
}

function updateTrain() {
  // Update the train data in the database
  if (getInputValues()) {
    var firstTrainTime = firstTimeString(time);
    var updatedTrain = new Train(name, destination, firstTrainTime, frequency);
    database.ref().child(updateKey).update(updatedTrain);
    updateDone();
  }
}

function getInputValues() {
  // Get the input values from the form
  name = $("#name").val().trim();
  destination = $("#destination").val().trim();
  time = $("#time").val().trim();
  frequency = $("#frequency").val().trim();
  if (name === "" || destination === "" || time === "" || frequency === "") {
    return false;
  }
  if (!checkTime(time)) {
    alert("Invalid time format!");
    return false;
  }
  return true;
}