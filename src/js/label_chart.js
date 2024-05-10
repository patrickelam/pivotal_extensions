const STORY_TYPES_TO_TRACK = ["feature", "bug", "chore"];

var add_label_chart = async (labels, iterationsToFetch, forceRefresh) => {
    removeLabelChart();

    var containerElement = createLabelChartContainerHTML();
    containerElement.appendChild(createLabelLoadingGifHTML());
    var chartElement = document.querySelector(`.cycle-time-chart`);
    chartElement.parentNode.parentNode.parentNode.appendChild(containerElement);

    var labelData = await assembleLabelData(labels, iterationsToFetch, forceRefresh);
    removeLabelChartLoadingGif()
    containerElement.appendChild(createLabelChartHTML(labelData, iterationsToFetch));
}

var assembleLabelData = async (labelsToTrack, iterationsToFetch, forceRefresh) => {
    var labelData = {};
    for(l in labelsToTrack) {
        var data = {
            points: 0,
            time: 0
        }
        for(type in STORY_TYPES_TO_TRACK) {
            data[STORY_TYPES_TO_TRACK[type]] = 0;
        }
        labelData[labelsToTrack[l]] = data;
    }
    var iterations = await fetchPrecedingIterations(iterationsToFetch, forceRefresh)
    for(let i = 0; i < iterations.length; i++) {
        for(let s = 0; s < iterations[i].stories.length; s++) {
            let story = iterations[i].stories[s];
            if( STORY_TYPES_TO_TRACK.indexOf(story.story_type) > -1) {
                for(let l = 0; l < story.labels.length; l++) {
                    if(labelsToTrack.indexOf(story.labels[l].name) > -1) {
                        let history = await fetchStoryHistory(story.id, forceRefresh);
                        var timeSpentData = determineTimeSpentInTrackableStates(history);
                        for(state in timeSpentData) {
                            labelData[story.labels[l].name].time += timeSpentData[state];
                        }
                        if(story.story_type === "feature") {
                            labelData[story.labels[l].name].points += story.estimate;
                        }
                        labelData[story.labels[l].name][story.story_type] += 1;
                    }
                }
            }
        }
    }
    return labelData;
}

var createLabelChartHTML = (labelData, iterationsToAverage) => {
    var containerElement = document.createElement("div");
    containerElement.setAttribute("class", "chart");

    var title = `Label Statistics Over ${iterationsToAverage} Iteration`;
    if(iterationsToAverage > 1) title += "s";
    containerElement.appendChild(createHeaderHTML(title));

    var tableElement = document.createElement("div");
    tableElement.setAttribute("class","chart_table");
    tableElement.appendChild(createLabelHeaderRow());

    for(label in labelData) {
        tableElement.appendChild(createLabelRowHTML(label, labelData[label]));
    }

    containerElement.appendChild(tableElement);
    return containerElement;
}

var createLabelRowHTML = (label, data) => {
    var tableRowElement = createRowHTML();
    var tagCell = createCellHTML(`${label}`);
    tagCell.setAttribute("class", "label_name chart_cell");
    tableRowElement.appendChild(tagCell);
    tableRowElement.appendChild(createCellHTML(`${data.time}`));

    var pointString = isNaN(data.points) ? "n/a" : data.points;
    tableRowElement.appendChild(createCellHTML(`${pointString}`));

    for(type in STORY_TYPES_TO_TRACK) {
        tableRowElement.appendChild(createCellHTML(`${data[STORY_TYPES_TO_TRACK[type]]}`));
    }
    return tableRowElement;
}

var createLabelHeaderRow = () => {
    var tableRowElement = createRowHTML();
    var tagCell = createColumnHeaderHTML(`Label`);
    tagCell.setAttribute("class", "label_name chart_column_header");
    tableRowElement.appendChild(tagCell);
    tableRowElement.appendChild(createColumnHeaderHTML(`Time <div class="chart_subhead">Total (h)</div>`));
    tableRowElement.appendChild(createColumnHeaderHTML(`Points <div class="chart_subhead">Total</div>`));
    for(type in STORY_TYPES_TO_TRACK) {
        tableRowElement.appendChild(createColumnHeaderHTML(`${capitalizeFirstLetter(STORY_TYPES_TO_TRACK[type])} <div class="chart_subhead">Count</div>`));
    }
    return tableRowElement;
}

var createLabelChartContainerHTML = () => {
    var containerElement = document.createElement("div");
    containerElement.setAttribute("class", "label_chart_container");
    containerElement.setAttribute("type", "pivotal_extensions_label_chart");
    return containerElement;
}

var labelChartExists = () => {
    var chart = document.querySelector('[type="pivotal_extensions_label_chart"]');
    if(chart != undefined) {
        return true;
    };
    return false;
}

var removeLabelChart = () => {
    var old_element = document.querySelector('[type="pivotal_extensions_label_chart"]');
    if(old_element != undefined) {
        old_element.remove();
    };
}

var removeLabelChartLoadingGif = () => {
    var old_element = document.querySelector('[class="label_loading_gif"]');
    if(old_element != undefined) {
        old_element.remove();
    };
}

var createLabelLoadingGifHTML = () => {
    var gifElement = createLoadingGifHTML();
    gifElement.setAttribute("class", "label_loading_gif");
    return gifElement;
}