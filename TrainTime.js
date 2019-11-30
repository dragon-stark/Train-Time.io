
$(document).ready(function ()
{
  var firebaseConfig = {
    apiKey: 'AIzaSyDuvnyCEyOiT42PqMrIe4GYx5Dg-FHv0Tw',
    authDomain: 'train-time-75eb6.firebaseapp.com',
    databaseURL: 'https://train-time-75eb6.firebaseio.com',
    projectId: 'train-time-75eb6',
    storageBucket: 'train-time-75eb6.appspot.com',
    messagingSenderId: '677879798054',
    appId: '1:677879798054:web:af95ebc4fc5ef9e8a209e7',
  };
  firebase.initializeApp(firebaseConfig);

  var database = firebase.database();
  //variable to store key of object to update.
  var updateKey;
  //to hold input values
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
  //  how many minutes til next train
  function getMinutesAway (time)
  {
    var minutesAway = Math.round(getNextArrival(time).diff(moment(), "minutes", true));
    return (minutesAway === 0) ? "Arrived" : minutesAway
  }
  // trains data
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
        var newDiv = $("<div>")
        newDiv.attr(
          {
            "key": key,
            "data-toggle": "tooltip",
            "data-placement": "left",

          });

        newTableRow.append($("<td>").html(newDiv));
        var newDiv = $("<div>")
        newDiv.attr(
          {
            "key": key,
            "data-toggle": "tooltip",
            "data-placement": "center",
          });
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

  // input fields
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

  function updateDone ()
  {
    $("#name").val("");
    $("#destination").val("");
    $("#time").val("");
    $("#frequency").val("");
    $("#add-panel").slideUp();
    $("#add-title").html("Add Train");
    $("#submit-btn").css("display", "initial");

  }
  //train data
  function updateTrain ()
  {
    if (getInputValues()) {
      var firstTrainTime = firstTimeString(time);
      var newTrain = new Train(name, destination, firstTrainTime, frequency);
      database.ref("/" + updateKey).update(newTrain);
      updateDone();
    }
  }

  function getInputValues ()
  {
    name = $("#name").val().trim();
    destination = $("#destination").val().trim();
    time = $("#time").val().trim().replace("");
    frequency = parseInt($("#frequency").val().trim());

    //Clears  box fields
    $("#name").val("");
    $("#destination").val("");
    $("#time").val("");
    $("#frequency").val("");
    return true;
  }

})
