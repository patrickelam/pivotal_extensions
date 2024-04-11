const ADD_DAYS_IN_PROGRESS = "add_days_in_progress"
const ITERATION_PROGRESS = "iteration_progress"
const CYCLE_TIME_CHART = "cycle_time_chart"
const CYCLE_TIME_ITERATIONS = "cycle_time_iterations"

var handleSendEventResponse = (response) => {
    //console.log("handleMessageSendResponse:");
    //console.log(response);
}

var handleSendEventError = (e) => {
    console.log("handleMessageSendError:");
    console.log(e);
}

var sendEvent = (event, data, handleSuccess, handleFailure) => {
    chrome.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
        for (const tab of tabs) {
            chrome.tabs
              .sendMessage(tab.id, { event : event, data : data })
              .then(handleSuccess, handleFailure);
          }
    });
}

var sendRefreshEvent = () => {
    sendEvent("refresh",null,handleSendEventResponse,handleSendEventError);
}

var sendForceRefreshEvent = () => {
    sendEvent("force_refresh",null,handleSendEventResponse,handleSendEventError);
}

var updateCheckbox = (id, newValue) => {
    if(newValue === "true") {
        document.getElementById(`${id}`).checked = true;
    } else {
        document.getElementById(`${id}`).checked = false;
    }
}

var updateNumberInput = (id, newValue) => {
    document.getElementById(`${id}`).value = newValue
}

var readPrefsFromStorage = () => {
    chrome.storage.local.get([
            ADD_DAYS_IN_PROGRESS,
            ITERATION_PROGRESS,
            CYCLE_TIME_CHART,
            CYCLE_TIME_ITERATIONS
        ]).then((result) => 
    {
        var add_days_in_progress = result[ADD_DAYS_IN_PROGRESS];
        if(!add_days_in_progress) add_days_in_progress = "true";

        var iteration_progress = result[ITERATION_PROGRESS];
        if(!iteration_progress) iteration_progress = "true";

        var cycle_time_count = result[CYCLE_TIME_CHART];
        if(!cycle_time_count) cycle_time_count = "true";

        var cycle_time_iterations = parseInt(result[CYCLE_TIME_ITERATIONS]);
        if(!cycle_time_iterations) cycle_time_iterations = 2;

        updateCheckbox("days_in_progress", add_days_in_progress);
        updateCheckbox("iteration_progress", iteration_progress);
        updateCheckbox("cycle_time_chart", cycle_time_count);
        updateNumberInput("cycle_time_iterations", cycle_time_iterations);
      });
}

var writePrefsToStorage = (prefs) => {
    chrome.storage.local.set({ 
        [ADD_DAYS_IN_PROGRESS]: prefs[ADD_DAYS_IN_PROGRESS].toString(),
        [ITERATION_PROGRESS]: prefs[ITERATION_PROGRESS].toString(),
        [CYCLE_TIME_CHART]: prefs[CYCLE_TIME_CHART].toString(),
        [CYCLE_TIME_ITERATIONS]: prefs[CYCLE_TIME_ITERATIONS].toString()
    }).then(() => {
        sendRefreshEvent();
    });
}

var collectPreferences = () => {
    var add_days_in_progress_cb = document.getElementById("days_in_progress").checked.toString();
    var add_iteration_progress_cb = document.getElementById("iteration_progress").checked.toString();
    var cycle_time_chart_cb = document.getElementById("cycle_time_chart").checked.toString();
    var cycle_time_iterations_input = parseInt(document.getElementById("cycle_time_iterations").value);
    if(!cycle_time_iterations_input) cycle_time_iterations_input = 2;
    return { 
        [ADD_DAYS_IN_PROGRESS] : add_days_in_progress_cb, 
        [ITERATION_PROGRESS] : add_iteration_progress_cb,
        [CYCLE_TIME_CHART] : cycle_time_chart_cb,
        [CYCLE_TIME_ITERATIONS] : cycle_time_iterations_input.toString()
    };
}

var handlePreferencesChanged = () => {
    writePrefsToStorage(collectPreferences());
}

var handleRefreshClicked = () => {
    sendForceRefreshEvent();
}

document.addEventListener("click", (e) => { 
    if (e.target.id === "refresh") {
        handleRefreshClicked();
    } else if (
        e.target.id === "days_in_progress" ||
        e.target.id === "iteration_progress" ||
        e.target.id === "cycle_time_chart" ||
        e.target.id === "cycle_time_iterations" ) {
        handlePreferencesChanged();
    }
});
document.addEventListener('keydown', function onEvent(e) {
    if (e.target.id === "cycle_time_iterations" && e.key === "Enter") {
        handlePreferencesChanged();
    }
});

readPrefsFromStorage();