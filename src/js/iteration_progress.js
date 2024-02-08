
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
    if(containerElement != null) var headerElement = containerElement.querySelector("header");
    if(containerElement != null && headerElement != null) {
        var newElement = `
        <div class="iteration_progress_container" type="pivotal_extensions_iteration_progress">
            <div class="progress_header">Time:</div>
            <div class="progress_background">
                <ul class="flexbox">
                    <li class="progress_bar" style="background-color: green; width: ${iterationCompletePercent}%"></li>
                </ul>
            </div>
            <div class="progress_header">Points:</div>
            <div class="progress_background">
                <ul class="flexbox">
                    <li class="progress_bar" style="background-color: green; width: ${pointsAcceptedPercent}%"><div class="progress_bar_label">Accepted</div></li>
                    <li class="progress_bar" style="background-color: blue; width: ${pointsDeliveredPercent}%"><div class="progress_bar_label">Delivered</div></li>
                    <li class="progress_bar" style="background-color: yellow; width: ${pointsInProgressPercent}%"><div class="progress_bar_label">In Progress</div></li>
                    <li class="progress_bar" style="background-color: orange; width: ${pointsPlannedPercent}%"><div class="progress_bar_label">Planned</div></li>
                </ul>
            </div>
            <div class="progress_header">Stories:</div>
            <div class="progress_background">
                <ul class="flexbox">
                    <li class="progress_bar" style="background-color: green; width: ${storiesAcceptedPercent}%"><div class="progress_bar_label">Accepted</div></li>
                    <li class="progress_bar" style="background-color: blue; width: ${storiesDeliveredPercent}%"><div class="progress_bar_label">Delivered</div></li>
                    <li class="progress_bar" style="background-color: yellow; width: ${storiesInProgressPercent}%"><div class="progress_bar_label">In Progress</div></li>
                    <li class="progress_bar" style="background-color: orange; width: ${storiesPlannedPercent}%"><div class="progress_bar_label">Planned</div></li>
                </ul>
            </div>
        </div>`;

        headerElement.insertAdjacentHTML("beforebegin", newElement);
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