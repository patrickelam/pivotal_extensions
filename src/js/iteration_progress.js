
var createContainerHTML = () => {
    var containerElement = document.createElement("div");
    containerElement.setAttribute("class", "iteration_progress_container");
    containerElement.setAttribute("type", "pivotal_extensions_iteration_progress");
    return containerElement;
}

var createHeaderHTML = (title) => {
    var headerElement = document.createElement("div");
    headerElement.setAttribute("class", "progress_header");
    headerElement.innerText = `${title}`;
    return headerElement;
}

var createProgressBarSegmentLabelHTML = (label) => {
    var labelElement = document.createElement("div");
    labelElement.setAttribute("class", "progress_bar_label");
    labelElement.innerText = label;
    return labelElement;
}

var createProgressBarSegmentHTML = (label, color, width) => {
    var segment = document.createElement("li");
    segment.setAttribute("class", "progress_bar");
    segment.style["background-color"] = color;
    segment.style["width"] = width;
    segment.appendChild(createProgressBarSegmentLabelHTML(label));
    return segment;
}

var createProgressBarHTML = (segments) => {
    var containerElement = document.createElement("div");
    containerElement.setAttribute("class", "progress_background");
    var bar = document.createElement("ul");
    bar.setAttribute("class", "flexbox");
    for(var i = 0; i < segments.length; i++) {
        var segmentElement = createProgressBarSegmentHTML(segments[i].label, segments[i].color, segments[i].width);
        bar.appendChild(segmentElement);
    }
    containerElement.appendChild(bar);
    return containerElement;
}

var insertHTML = (
    storiesAcceptedPercent,
    storiesDeliveredPercent,
    storiesInProgressPercent,
    storiesPlannedPercent,
    pointsAcceptedPercent,
    pointsDeliveredPercent,
    pointsInProgressPercent,
    pointsPlannedPercent,
    iterationCompletePercent) => 
    {
    var containerElement = document.querySelector(`#panel_backlog_${extractProjectId()}`);

    if(containerElement != null) var wrapperElement = containerElement.firstChild;
    if(containerElement != null && wrapperElement != null) var headerElement = wrapperElement.querySelector("header");
    if(containerElement != null && wrapperElement != null && headerElement != null) {
        var newElement = createContainerHTML();
        newElement.appendChild(createHeaderHTML("Time"));
        newElement.appendChild(createProgressBarHTML([
            {label: "Time:", color: "green", width: iterationCompletePercent}
        ]));

        newElement.appendChild(createHeaderHTML("Points"));
        newElement.appendChild(createProgressBarHTML([
            {label: "Accepted", color: "green", width: `${pointsAcceptedPercent}%`},
            {label: "Delivered", color: "blue", width: `${pointsDeliveredPercent}%`},
            {label: "In Progress", color: "yellow", width: `${pointsInProgressPercent}%`},
            {label: "Unstarted", color: "orange", width: `${pointsPlannedPercent}%`}
        ]));

        newElement.appendChild(createHeaderHTML("Stories"));
        newElement.appendChild(createProgressBarHTML([
            {label: "Accepted", color: "green", width: storiesAcceptedPercent},
            {label: "Delivered", color: "blue", width: storiesDeliveredPercent},
            {label: "In Progress", color: "yellow", width: storiesInProgressPercent},
            {label: "Unstarted", color: "orange", width: storiesPlannedPercent}
        ]));

        wrapperElement.insertBefore(newElement, wrapperElement.firstChild);
    }
}

var addIterationProgress = async (forceRefresh) => {
    if(headersAreSet()) {
        removeIterationProgress();
        var iterationList = await fetchCurrentIteration(forceRefresh);
        var stories = iterationList[0]["stories"];

        var storiesAccepted = 0;
        var storiesDelivered = 0;
        var storiesInProgress = 0;
        var storiesPlanned = 0;
        var pointsAccepted = 0;
        var pointsDelivered = 0;
        var pointsInProgress = 0;
        var pointsPlanned = 0;

        for(story in Object.keys(stories)) {
            if(stories[story].story_type !== "release") {
                switch(stories[story].current_state) {
                    case "delivered":
                        storiesDelivered++;
                        if(stories[story].estimate) pointsDelivered += stories[story].estimate;
                        break;
                    case "planned":
                        storiesPlanned++;
                        if(stories[story].estimate) pointsPlanned += stories[story].estimate;
                        break;
                    case "started":
                        storiesInProgress++;
                        if(stories[story].estimate) pointsInProgress += stories[story].estimate;
                        break;
                    case "accepted":
                        storiesAccepted++;
                        if(stories[story].estimate) pointsAccepted += stories[story].estimate;
                        break;
                }        
            }
        }
        
        var totalStories = storiesAccepted + storiesDelivered + storiesInProgress + storiesPlanned;
        var totalPoints = pointsAccepted + pointsDelivered + pointsInProgress + pointsPlanned;
            
        var startDT = Date.parse(iterationList[0]["start"]);
        var endDT = Date.parse(iterationList[0]["finish"]);
        var iterationLength = endDT - startDT;
        var iterationCompletePercent = ((new Date() - startDT) / iterationLength) * 100;

        insertHTML(
            (storiesAccepted / totalStories) * 100,
            (storiesDelivered / totalStories) * 100,
            (storiesInProgress / totalStories) * 100,
            (storiesPlanned / totalStories) * 100,
            (pointsAccepted / totalPoints) * 100,
            (pointsDelivered / totalPoints) * 100,
            (pointsInProgress / totalPoints) * 100,
            (pointsPlanned / totalPoints) * 100,
            iterationCompletePercent
        );
    }
}

var removeIterationProgress = async () => {
    var old_element = document.querySelector('[type="pivotal_extensions_iteration_progress"]');
    if(old_element != undefined) {
        old_element.remove();
    };
}