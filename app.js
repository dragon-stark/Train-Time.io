

var config = {
  apiKey: "AIzaSyDuvnyCEyOiT42PqMrIe4GYx5Dg-FHv0Tw",
  authDomain: "train-time-75eb6.firebaseapp.com",
  databaseURL: "https://train-time-75eb6.firebaseio.com",
  projectId: "train-time-75eb6",
  storageBucket: "train-time-75eb6.appspot.com",
  messagingSenderId: "677879798054",
  appId: "1:677879798054:web:af95ebc4fc5ef9e8a209e7"
};
// Initialize Firebase
firebase.initializeApp(config);
const database = firebase.database();

// Global variables
let firebaseDataObject = null; // Stores the data retrieved from Firebase
let updateKey; // Key of the train being updated
let name; // Input field value for train name
let destination; // Input field value for train destination
let time; // Input field value for train first train time
let frequency; // Input field value for train frequency

// Train constructor function
function Train(name, destination, firstTrainTime, frequency) {
  this.name = name;
  this.destination = destination;
  this.firstTrainTime = firstTrainTime;
  this.frequency = frequency;
}

// Execute when the document is ready
$(document).ready(function() {
  const $currentTime = $("#current-time");
  $currentTime.text(moment().format("MMM DD HH:mm A"));

  // Update current time every minute
  setInterval(function() {
    $currentTime.text(moment().format("MMM DD HH:mm A"));
    displayTrainSchedule();
  }, 60000);

  // Retrieve data from Firebase and display train schedule
  database.ref().on("value", function(data) {
    firebaseDataObject = data.val();
    displayTrainSchedule();
  }, function(objectError) {
    console.log("error:" + objectError.code);
  });
});

// Submit button click event
$("#submit-btn").on("click", function(event) {
  event.preventDefault();
  if (getInputValues()) {
    const firstTrainTime = firstTimeString(time);
    const newTrain = new Train(name, destination, firstTrainTime, frequency);
    database.ref().push(newTrain);
  }
});

// Remove button click event
$(document).on("click", ".remove", function() {
  const con = confirm("Are you sure you want to remove the train?");
  if (con) {
    const key = $(this).attr("key");
    database.ref().child(key).remove();
  }
});

// Update button click event
$(document).on("click", ".update", function() {
  updateKey = $(this).attr("key");
  displayUpdate();
});

// Close button click event
$("#close-btn").on("click", function(event) {
  event.preventDefault();
  updateDone();
});

// Update button click event
$("#update-btn").on("click", function(event) {
  event.preventDefault();
  updateTrain();
});

// Add train button click event
$("#add-train-btn").on("click", function(event) {
  event.preventDefault();
  $("#submit-btn").css("display", "initial");
  $("#add-panel").slideToggle();
});

// Function to get the next arrival time
function getNextArrival(time, frequency) {
  let nextArrival = moment(time);
  while (nextArrival < moment()) {
    nextArrival.add(frequency, "minutes");
  }
  return nextArrival;
}

// Function to get the minutes away for the next arrival
function getMinutesAway(time) {
  const minutesAway = Math.round(getNextArrival(time).diff(moment(), "minutes", true));
  return (minutesAway === 0) ? "Arrived" : minutesAway;
}

// Function to display the train schedule
function displayTrainSchedule() {
  const $schedule = $("#schedule");
  $schedule.empty();

  if (firebaseDataObject !== null) {
    Object.keys(firebaseDataObject).forEach(function(key) {
      const name = firebaseDataObject[key].name;
      const destination = firebaseDataObject[key].destination;
      const firstTrainTime = firebaseDataObject[key].firstTrainTime;
      const frequency = firebaseDataObject[key].frequency;
      const nextArrival = getNextArrival(firstTrainTime, frequency);
      const minutesAway = getMinutesAway(nextArrival);
      const newTableRow = $("<tr>");
      newTableRow.append($("<td>").html(name));
      newTableRow.append($("<td>").html(destination));
      newTableRow.append($("<td>").html(frequency));
      newTableRow.append($("<td>").html(nextArrival.format("MMM DD hh:mm A")));
      newTableRow.append($("<td>").html(minutesAway));

      const updateButton = $("<div>")
        .addClass("update")
        .attr({
          "key": key,
          "data-toggle": "tooltip",
          "data-placement": "left",
          "title": "Update"
        })
        .html("<span class='far fa-edit'></span>");
      newTableRow.append($("<td>").html(updateButton));

      const removeButton = $("<div>")
        .addClass("remove")
        .attr({
          "key": key,
          "data-toggle": "tooltip",
          "data-placement": "left",
          "title": "Remove"
        })
        .html("<span class='fas fa-trash-alt'></span>");
      newTableRow.append($("<td>").html(removeButton));

      $schedule.append(newTableRow);
    });
  }
}

// Function to format the first train time string
function firstTimeString(time) {
  const currentDateString = moment().format("YYYY-MM-DD");
  return currentDateString + "T" + time;
}

// Function to pad single-digit hours and minutes with leading zeros
function pad(time) {
  const array = time.split(":");
  array[0] = parseInt(array[0]);
  array[1] = parseInt(array[1]);

  if (array[0] < 10) {
    array[0] = '0' + array[0];
  }

  if (array[1] < 10) {
    array[1] = '0' + array[1];
  }

  return array[0] + ":" + array[1];
}

// Function to check if the entered time is valid
function checkTime(time) {
  const array = time.split(":");

  if (isNaN(array[0]) || isNaN(array[1])) {
    return false;
  }

  array[0] = parseInt(array[0]);
  array[1] = parseInt(array[1]);

  return (array[0] >= 0 && array[0] <= 23) && (array[1] >= 0 && array[1] <= 59);
}

// Function to display the update form
function displayUpdate() {
  $("#add-panel").slideDown();
  $("#submit-btn").css("display", "none");
  $("#update-btn").css("display", "initial");
  $("#add-title").html("Update Train");
  $("#name").val(firebaseDataObject[updateKey].name);
  $("#destination").val(firebaseDataObject[updateKey].destination);
  $("#time").val(moment(firebaseDataObject[updateKey].firstTrainTime).format("HH:mm"));
  $("#frequency").val(firebaseDataObject[updateKey].frequency);
}

// Function to reset the update form
function updateDone() {
  $("#name").val("");
  $("#destination").val("");
  $("#time").val("");
  $("#frequency").val("");
  $("#add-panel").slideUp();
  $("#add-title").html("Add Train");
  $("#submit-btn").css("display", "initial");
  $("#update-btn").css("display", "none");
}

// Function to update a train
function updateTrain() {
  if (getInputValues()) {
    const firstTrainTime = firstTimeString(time);
    const newTrain = new Train(name, destination, firstTrainTime, frequency);
    database.ref("/" + updateKey).update(newTrain);
    updateDone();
  }
}

// Function to get input field values
function getInputValues() {
  name = $("#name").val().trim();
  destination = $("#destination").val().trim();
  time = $("#time").val().trim().replace(/\s/g, "");
  frequency = parseInt($("#frequency").val().trim());

  if (name === "") {
    alert("Please enter a train name.");
    $("#name").val("").focus();
    return false;
  } else if (destination === "") {
    alert("Please enter a destination.");
    $("#destination").val("").focus();
    return false;
  } else if (!checkTime(time)) {
    alert("Please enter a valid first train time (HH:MM).");
    $("#time").val("").focus();
    return false;
  } else if (isNaN(frequency)) {
    alert("Please enter a frequency.");
    $("#frequency").val("").focus();
    return false;
  } else {
    time = pad(time);
    $("#name").val("");
    $("#destination").val("");
    $("#time").val("");
    $("#frequency").val("");
    return true;
  }
}