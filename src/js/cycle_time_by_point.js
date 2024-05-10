const TRACKABLE_STATES = ["unstarted", "started", "finished", "delivered", "accepted"];
const DISPLAYABLE_STATES = ["started", "finished", "delivered"]

var createCycleTimeContainerHTML = () => {
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

var createCycleTimeHeaderRow = () => {
    var tableRowElement = createRowHTML();
    tableRowElement.appendChild(createColumnHeaderHTML(`Estimate <div class="chart_subhead">(# of stories)</div>`));
    tableRowElement.appendChild(createColumnHeaderHTML(`Total Time <div class="chart_subhead">(Hours)</div>`));
    for(state in DISPLAYABLE_STATES) {
        tableRowElement.appendChild(createColumnHeaderHTML(`${capitalizeFirstLetter(DISPLAYABLE_STATES[state])} <div class="chart_subhead">(Hours)</div>`));
    }
    return tableRowElement;
}

var createEstimateRowHTML = (averageTimes, estimate) => {
    var tableRowElement = createRowHTML();
    tableRowElement.appendChild(createCellHTML(createPointColorBox(estimate) + `${estimate} (${averageTimes[estimate].count})`));
    tableRowElement.appendChild(createCellHTML(`${averageTimes[estimate].total}`));
    for(state in DISPLAYABLE_STATES) {
        tableRowElement.appendChild(createCellHTML(`${averageTimes[estimate][DISPLAYABLE_STATES[state]]}`));
    }
    return tableRowElement;
}

var createCycleTimeChartHTML = (averageTimes, iterationsToAverage) => {
    var containerElement = document.createElement("div");
    containerElement.setAttribute("class", "chart");
    
    var title = `Average Time Spent Over ${iterationsToAverage} Iteration`;
    if(iterationsToAverage > 1) title += "s";
    containerElement.appendChild(createHeaderHTML(title));

    var tableElement = document.createElement("div");
    tableElement.setAttribute("class","chart_table");

    tableElement.appendChild(createCycleTimeHeaderRow());

    for(let estimate in averageTimes) {
        tableElement.appendChild(createEstimateRowHTML(averageTimes, estimate));
    }

    containerElement.appendChild(tableElement);
    return containerElement;
}

var removeCycleTimeChart = () => {
    var old_element = document.querySelector('[type="pivotal_extensions_cycle_time_by_point"]');
    if(old_element != undefined) {
        old_element.remove();
    };
}

var cycleTimeChartExists = () => {
    var chart = document.querySelector('[type="pivotal_extensions_cycle_time_by_point"]');
    if(chart != undefined) {
        return true;
    };
    return false;
}

var removeCycleTimeLoadingGif = () => {
    var old_element = document.querySelector('[class="cycle_time_by_point_loading_gif"]');
    if(old_element != undefined) {
        old_element.remove();
    };
}

var createCycleTimeLoadingGifHTML = () => {
    var gifElement = createLoadingGifHTML();
    gifElement.setAttribute("class", "cycle_time_by_point_loading_gif");
    return gifElement;
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

var determineTimeSpentInTrackableStates = (history) => {
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

var bulkCacheStories = async (iterations, forceRefresh) => {
    var storiesToCache = [];
    for(let i = 0; i < iterations.length; i++) {
        for(let s = 0; s < iterations[i].stories.length; s++) {
            storiesToCache.push(iterations[i].stories[s].id);
        }
    }
    await fetchStoryHistories(storiesToCache, forceRefresh);
}

var assembleStoryStateData = async (iterations, forceRefresh) => {
    await bulkCacheStories(iterations, forceRefresh);
    var storyStateData = {};
    for(let i = 0; i < iterations.length; i++) {
        for(let s = 0; s < iterations[i].stories.length; s++) {
            let story = iterations[i].stories[s];
            if(story.story_type === "feature") {
                let history = await fetchStoryHistory(story.id, forceRefresh);

                var timeSpent = determineTimeSpentInTrackableStates(history);
                
                if(storyStateData[story.estimate] === undefined) {
                    storyStateData[story.estimate] = { count : 0, timeSpent : {}}
                    for(state in DISPLAYABLE_STATES) {
                        storyStateData[story.estimate].timeSpent[DISPLAYABLE_STATES[state]] = 0;
                    }
                } 
                storyStateData[story.estimate].count++;
                for(state in DISPLAYABLE_STATES) {
                    storyStateData[story.estimate].timeSpent[DISPLAYABLE_STATES[state]] += timeSpent[DISPLAYABLE_STATES[state]];
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
        for(state in DISPLAYABLE_STATES) {
            averageTimes[estimate][DISPLAYABLE_STATES[state]] = Math.round(storyStateData[estimate].timeSpent[DISPLAYABLE_STATES[state]] / storyStateData[estimate].count);
            averageTimes[estimate].total += averageTimes[estimate][DISPLAYABLE_STATES[state]];
        }
    }
    return averageTimes;
}

var addCycleTimeChart = async (iterationsToAverage, forceRefresh) => {
    removeCycleTimeChart();
    var chartElement = document.querySelector(`.cycle-time-chart`);
    var containerElement = createCycleTimeContainerHTML();
    containerElement.setAttribute("class", "chart_container");
    containerElement.appendChild(createCycleTimeLoadingGifHTML());
    chartElement.parentNode.parentNode.parentNode.appendChild(containerElement);

    var iterations = await fetchPrecedingIterations(iterationsToAverage, forceRefresh);
    var storyStateData = await assembleStoryStateData(iterations, forceRefresh);
    var averageTimes = calculateAverageTimeData(storyStateData);
    removeCycleTimeLoadingGif();
    
    containerElement.appendChild(createCycleTimeChartHTML(averageTimes, iterationsToAverage));
}