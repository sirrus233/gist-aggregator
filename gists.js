var DEBUG = true;

// Returns how many pages of results the user wants to see, by reading the selector
// in the html
function getNumRequests() {
    var selector = document.getElementById("pages");
    return selector.options[selector.selectedIndex].value;
}

// Called when the search button is clicked. Formulates an arbitrary number of queries
// of the Github API
function queryGists() {
    // Clear any old results that may exist in the "results" div
    document.getElementById("results").innerHTML = "";

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
            if (DEBUG) {
                console.log(request.responseText);
            }
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
        if (desc === null || desc === "") {
            desc = "Untitled";
        }
        resultsDiv.appendChild(createResultElement(url, desc, true));
    }
}

// Builds a single result element to insert into the document
function createResultElement(url, desc, favorite) {
    // Simple div to hold result
    var result = document.createElement('div');

    // Link to the Gist
    var link = document.createElement('a');
    link.href = url;
    link.appendChild(document.createTextNode(desc));
    result.appendChild(link); 

    // Button (to either favorite or unfavorite the link, based on input parameter)
    var fav = document.createElement('button');
    fav.type = "button";
    if (favorite) {
        fav.onclick = function() {addFavorite(url, desc)};
        fav.appendChild(document.createTextNode("Favorite"));
    } else {
        fav.onclick = function() {removeFavorite(url, desc)};
        fav.appendChild(document.createTextNode("Unfavorite"));
    }
    result.appendChild(fav); 

    return result;
}

// Populate the favorites list with anything inside localStorage
function loadFavorites() {
    // Clear old favorites
    document.getElementById("favorites").innerHTML = "";

    for (var i = 0; i < localStorage.length; i++) {
        // Key is a url, mapped to a description
        var key = localStorage.key(i);
        var val = localStorage.getItem(key);
        document.getElementById("favorites").appendChild(createResultElement(key, val, false));
    }
}

// Clears the localStorage, then refreshes the favorites list, which should now be empty
function deleteFavorites() {
    localStorage.clear();
    loadFavorites();
}

function addFavorite(url, desc) {
    localStorage.setItem(url, desc);
    loadFavorites();
}

function removeFavorite(url, desc) {
    //TODO
}
