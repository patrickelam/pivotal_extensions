var capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var createCellHTML = (content) => {
    var cellElement = document.createElement("div");
    cellElement.innerHTML = `${content}`;
    cellElement.setAttribute("class","chart_cell");
    return cellElement;
}

var createSubHeaderHTML = () => {
    var headerElement = document.createElement("div");
    headerElement.setAttribute("class","chart_subhead");
    headerElement.innerHTML = `Not Including Current Iteration`;
    return headerElement;
}

var createHeaderHTML = (title) => {
    var headerElement = document.createElement("div");
    headerElement.setAttribute("class","chart_header");
    headerElement.innerText = title;
    headerElement.appendChild(createSubHeaderHTML());
    return headerElement;
}

var createRowHTML = () => {
    var tableRowElement = document.createElement("div");
    tableRowElement.setAttribute("class","chart_row");
    return tableRowElement;
}

var createColumnHeaderHTML = (content) => {
    var cellElement = document.createElement("div");
    cellElement.innerHTML = `${content}`;
    cellElement.setAttribute("class","chart_column_header");
    return cellElement;
}

var createLoadingGifHTML = () => {
    var containerElement = document.createElement("img");
    containerElement.setAttribute("type", "pivotal_extensions_loading_gif");
    var gifURL = chrome.runtime.getURL("assets/loading.gif");
    containerElement.src = gifURL;
    return containerElement;
}