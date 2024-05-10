const CYCLE_TIME_CHART = "cycle_time_chart"
const CYCLE_TIME_ITERATIONS = "cycle_time_iterations"
const SHOW_LABEL_CHART = "show_label_chart"
const LABEL_LIST = "label_list"

var readPrefsFromStorageAndUpdate = (forceRefresh) => {    
    chrome.storage.local.get([CYCLE_TIME_CHART,CYCLE_TIME_ITERATIONS,SHOW_LABEL_CHART,LABEL_LIST]).then((result) => {
        var cycle_time_chart = result[CYCLE_TIME_CHART];
        if(!cycle_time_chart) cycle_time_chart = "true";

        var cycle_time_iterations = parseInt(result[CYCLE_TIME_ITERATIONS]);
        if(!cycle_time_iterations) cycle_time_iterations = 2;

        var show_label_chart = result[SHOW_LABEL_CHART];
        if(!show_label_chart) show_label_chart = "true";

        var label_list = result[LABEL_LIST];
        if(!label_list) label_list = "";

        var preferences = {
            [CYCLE_TIME_CHART] : cycle_time_chart, 
            [CYCLE_TIME_ITERATIONS] : cycle_time_iterations,
            [SHOW_LABEL_CHART] : show_label_chart,
            [LABEL_LIST] : label_list
        };
        updatePage(preferences, forceRefresh);
      });
      
}

var updatePage = (preferences, forceRefresh) => {
    
    if(preferences[SHOW_LABEL_CHART] === "true" && isOnCycleTimeByPoint()) {
        if(labelChartExists()) {
            removeLabelChart();
        }
        add_label_chart(preferences[LABEL_LIST].split(","), preferences[CYCLE_TIME_ITERATIONS], forceRefresh);
    } else {
        removeLabelChart();
    }

    if(preferences[CYCLE_TIME_CHART] === "true" && isOnCycleTimeByPoint()) {
        if(cycleTimeChartExists()) {
            removeCycleTimeChart();
        }
        addCycleTimeChart(preferences[CYCLE_TIME_ITERATIONS], forceRefresh);
    } else {
        removeCycleTimeChart();
    }
}

var handleRefreshEvent = () => {
    readPrefsFromStorageAndUpdate(false);
}

var handleForceRefreshEvent = () => {
    console.log("force refresh")
    readPrefsFromStorageAndUpdate(true);
}

var handleSetTokenEvent = (data) => {
    setCookie(data.token);
}

var handleMessage = (request, sender, sendResponse) => {
    switch(request.event) {
        case "refresh":
            handleRefreshEvent();
            break;
        case "set_token":
            handleSetTokenEvent(request.data);
            break;
        case "force_refresh":
            handleForceRefreshEvent();
            break;
    }
}

var isOnCycleTimeByPoint = () => {
    var urlElements = window.location.href.split("/");
    var isCycleTime = urlElements.findIndex((e) => e === "cycle_time") >= -1;
    var isurlparam = getUrlParameter("display") === "estimate";
    return isCycleTime && isurlparam;
}

chrome.runtime.onMessage.addListener(handleMessage);

waitForElement(`.cycle-time-chart`).then((elm) => {
    if(isOnCycleTimeByPoint() && !cycleTimeChartExists() && !labelChartExists()) {
        readPrefsFromStorageAndUpdate(false);
    }
});
  
observeUrlChange(() => {
    if(isOnCycleTimeByPoint() && !cycleTimeChartExists() && !labelChartExists()) {
        readPrefsFromStorageAndUpdate(false);
    }
});