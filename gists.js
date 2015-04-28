// Returns how many pages of results the user wants to see, by reading the selector
// in the html
function getNumRequests() {
    var selector = document.getElementById("pages");
    return selector.options[selector.selectedIndex].value;
}

// Called when the search button is clicked. Formulates an arbitrary number of queries
// of the Github API
function queryGists() {
    var requests = [];
    for (var i = 0; i < getNumRequests(); i++) {
        requests[i] = new XMLHttpRequest();
        // Page numbers in the Github API are indexed from 1, not 0.
        requests[i].open("GET", "https://api.github.com/gists/public?page="+(i+1), true);
        requests[i].onreadystatechange = getHttpRequestCallback(requests[i]);
        requests[i].send();
    }
}

// Returns a function which should be called by the HttpRequest when it is 
// finished communicating with the server. Should be set as the onreadystatechange callback
function getHttpRequestCallback(request) {
    return function() {
        if (request.readyState === 4 && request.status === 200) {
            var gistArray = JSON.parse(request.responseText);
            displayResults(gistArray);
        }
    }
}

// Displays gists to the screen. Input should be an array of gist objects
function displayResults(gists) {
    var resultsDiv = document.getElementById("results");
    for (var i = 0; i < gists.length; i++) {
        var url = gists[i].html_url;
        var desc = gists[i].description;
        var gistDiv = document.createElement('div');
        gistDiv.innerHTML = "<a href=\""+url+"\">"+desc+"</a>";
        resultsDiv.appendChild(gistDiv);
    }
}
