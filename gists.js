// Returns how many pages of results the user wants to see, by reading the selector
// in the html
function getNumRequests() {
    var selector = document.getElementById("pages");
    return selector.options[selector.selectedIndex].value;
}

// Called when the search button is clicked. Formulates an arbitrary number of queries
// of the Github API
function queryGists() {
    for (var i = 1; i <= getNumRequests(); i++) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {
                httpRequestCallback(request);
            }
        }
        request.open("GET", "https://api.github.com/gists/public?page="+i, true);
        request.send();
    }
}

// Called by the HttpRequest when it is finished communicating with the server
function httpRequestCallback(request) {
    var gistArray = JSON.parse(request.responseText);
    displayResults(gistArray);
}

// Displays gists to the screen. Input should be an array of gist objects
function displayResults(gists) {
    for (var i = 0; i < gists.length; i++) {
        console.log(gists[i].description);
    }
}
