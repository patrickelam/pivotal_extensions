const TRACKABLE_STATES = ["started", "finished", "delivered", "accepted"];

var createContainerHTML = () => {
    var containerElement = document.createElement("div");
    containerElement.setAttribute("class", "cycle_time_by_point_container");
    containerElement.setAttribute("type", "pivotal_extensions_cycle_time_by_point");
    return containerElement;
}

var createPointColorBox = (estimate) => {
    var color;
    if(estimate === "0") {
        color = "rgb(83, 189, 235)";
    } else if (estimate === "1") {
        color = "rgb(252, 161, 0)";
    } else if (estimate === "2") {
        color = "rgb(49, 189, 130)";
    } else if (estimate === "3") {
        color = "rgb(239, 225, 41)";
    } else if (estimate === "5") {
        color = "rgb(120, 118, 225)";
    } else if (estimate === "8") {
        color = "rgb(229, 96, 31)";
    } else if (estimate === "13") {
        color = "rgb(225, 124, 172)";
    } else {
        color = "rgb(0, 0, 0)";
    }

    return(`<span style="border-top: 10px solid ${color};display:inline-block;width:10px;margin-right:5px"></span>`)
}

var capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var createSubHeaderHTML = () => {
    var headerElement = document.createElement("div");
    headerElement.setAttribute("class","chart_subhead");
    headerElement.innerHTML = `Not Including Current Iteration`;
    return headerElement;
}

var createHeaderHTML = (iterations) => {
    var headerElement = document.createElement("div");
    headerElement.setAttribute("class","chart_header");
    if(iterations === 1) {
        headerElement.innerHTML = `Average Time Spent over 1 iteration`;
    } else {
        headerElement.innerHTML = `Average Time Spent over ${iterations} iterations`;
    }
    headerElement.appendChild(createSubHeaderHTML());
    return headerElement;
}

var createCellHTML = (content) => {
    var cellElement = document.createElement("div");
    cellElement.innerHTML = `${content}`;
    cellElement.setAttribute("class","chart_cell");
    return cellElement;
}

var createColumnHeaderHTML = (content) => {
    var cellElement = document.createElement("div");
    cellElement.innerHTML = `${content}`;
    cellElement.setAttribute("class","chart_column_header");
    return cellElement;
}

var createRowHTML = () => {
    var tableRowElement = document.createElement("div");
    tableRowElement.setAttribute("class","chart_row");
    return tableRowElement;
}

var createHeaderRow = () => {
    var tableRowElement = createRowHTML();
    tableRowElement.appendChild(createColumnHeaderHTML(`Estimate <div class="chart_subhead">(# of stories)</div>`));
    tableRowElement.appendChild(createColumnHeaderHTML(`Total Time`));
    for(state in TRACKABLE_STATES) {
        tableRowElement.appendChild(createColumnHeaderHTML(`${capitalizeFirstLetter(TRACKABLE_STATES[state])}`));
    }
    return tableRowElement;
}

var createEstimateRowHTML = (averageTimes, estimate) => {
    var tableRowElement = createRowHTML();
    tableRowElement.appendChild(createCellHTML(createPointColorBox(estimate) + `${estimate} (${averageTimes[estimate].count})`));
    tableRowElement.appendChild(createCellHTML(`${averageTimes[estimate].total}`));
    for(state in TRACKABLE_STATES) {
        tableRowElement.appendChild(createCellHTML(`${averageTimes[estimate][TRACKABLE_STATES[state]]}`));
    }
    return tableRowElement;
}

var createTableHTML = (averageTimes, iterationsToAverage) => {
    var containerElement = document.createElement("div");
    containerElement.setAttribute("class", "chart_container");
    
    containerElement.appendChild(createHeaderHTML(iterationsToAverage));

    var tableElement = document.createElement("div");
    tableElement.setAttribute("class","chart_table");

    tableElement.appendChild(createHeaderRow());

    for(let estimate in averageTimes) {
        tableElement.appendChild(createEstimateRowHTML(averageTimes, estimate));
    }

    containerElement.appendChild(tableElement);
    return containerElement;
}

var removeChart = () => {
    var old_element = document.querySelector('[type="pivotal_extensions_cycle_time_by_point"]');
    if(old_element != undefined) {
        old_element.remove();
    };
}

var chartExists = () => {
    var chart = document.querySelector('[type="pivotal_extensions_cycle_time_by_point"]');
    if(chart != undefined) {
        return true;
    };
    return false;
}

var removeLoadingGif = () => {
    var old_element = document.querySelector('[type="pivotal_extensions_loading_gif"]');
    if(old_element != undefined) {
        old_element.remove();
    };
}

var createLoadingGifHTML = () => {
    var containerElement = document.createElement("img");
    containerElement.setAttribute("type", "pivotal_extensions_loading_gif");
    containerElement.setAttribute("class", "cycle_time_by_point_loading_gif");
    var gifURL = chrome.runtime.getURL("assets/loading.gif");
    containerElement.src = gifURL;
    return containerElement;
}

// Counts 24 hours a day, minus weekends
var hoursBetweenDates = (earlier, later) => {
    const MS_IN_HR = 3600000;

    var earlierDate = new Date(earlier);
    var laterDate = new Date(later);
    var diff = laterDate - earlierDate;
    var weekendDayCount = 0;

    var counter = laterDate - (24*MS_IN_HR);
    while(counter > earlierDate) {
        let counterDate = new Date(counter);
        if(counterDate.getDay() == 0 || counterDate.getDay() == 6) {
            weekendDayCount++;
        }
        counter = counter - (24*MS_IN_HR);
    }
    return Math.ceil((diff - (weekendDayCount*24*MS_IN_HR))/MS_IN_HR);
}

var determineTimeSpentInEachState = (history) => {
    var timeSpent = {};
    var trackedState = {};
    for(state in TRACKABLE_STATES) {
        timeSpent[TRACKABLE_STATES[state]] = 0;
    }
    for(let i = history.length - 1; i >= 0; i--) {        
        if(TRACKABLE_STATES.includes(history[i].highlight)) {
            if(trackedState.highlight === undefined) {
                trackedState.highlight = history[i].highlight;
                trackedState.occurred_at = history[i].occurred_at;
            } else {
                var hoursBetween = hoursBetweenDates(trackedState.occurred_at, history[i].occurred_at);
                timeSpent[trackedState.highlight] += hoursBetween;
                trackedState.highlight = history[i].highlight;
                trackedState.occurred_at = history[i].occurred_at;
            }
        }
    }
    return timeSpent;
}

var processStoryStateData = async (iterations) => {
    var storyStateData = {};
    for(let i = 0; i < iterations.length; i++) {
        console.log(`Processing iteration ${iterations[i].number}`);
        for(let s = 0; s < iterations[i].stories.length; s++) {
            let story = iterations[i].stories[s];
            if(story.story_type === "feature") {
                let history = await fetchStoryHistory(story.id, false);

                var timeSpent = determineTimeSpentInEachState(history);
                
                if(storyStateData[story.estimate] === undefined) {
                    storyStateData[story.estimate] = { count : 0, timeSpent : {}}
                    for(state in TRACKABLE_STATES) {
                        storyStateData[story.estimate].timeSpent[TRACKABLE_STATES[state]] = 0;
                    }
                } else {
                    storyStateData[story.estimate].count++;
                    for(state in TRACKABLE_STATES) {
                        storyStateData[story.estimate].timeSpent[TRACKABLE_STATES[state]] += timeSpent[TRACKABLE_STATES[state]];
                    }
                }
            }   
        }
    }
    return storyStateData;
}

var calculateAverageTimeData = (storyStateData) => {
    var averageTimes = {}
    for(estimate in storyStateData) {
        averageTimes[estimate] = {
            count : storyStateData[estimate].count,
            total : 0
        };
        for(state in TRACKABLE_STATES) {
            averageTimes[estimate][TRACKABLE_STATES[state]] = Math.round(storyStateData[estimate].timeSpent[TRACKABLE_STATES[state]] / storyStateData[estimate].count);
            averageTimes[estimate].total += averageTimes[estimate][TRACKABLE_STATES[state]];
        }
    }
    return averageTimes;
}

var addCycleTimeChart = async (iterationsToAverage) => {

    removeChart();
    var chartElement = document.querySelector(`.cycle-time-chart`);
    var containerElement = createContainerHTML();
    containerElement.setAttribute("class", "cycle_time_average");
    containerElement.appendChild(createLoadingGifHTML());
    chartElement.parentNode.parentNode.parentNode.appendChild(containerElement);

    var iterations = await fetchPrecedingIterations(iterationsToAverage);
    var storyStateData = await processStoryStateData(iterations);
    var averageTimes = calculateAverageTimeData(storyStateData);
    
    removeLoadingGif();
    
    containerElement.appendChild(createTableHTML(averageTimes, iterationsToAverage));
}