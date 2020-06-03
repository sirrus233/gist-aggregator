var DEBUG = false;

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
        // Call a function that returns another function, which gets assigned to this property
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
            filterResults();
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
        // TRICKY: Cannot simply assign the "addFavorite" function here, because we 
        // can't pass it parameters that way (it's an assignment of the function to a 
        // variable, not an actual call of the function). To get around this, we create
        // an anonymous function that wraps a *call* to addFavorite(), and then assign
        // that anonymous function to the onclick property. Similar trick to how
        // the callback function was assigned to XMLHttpRequest.onreadystatechange
        fav.onclick = function() {addFavorite(url, desc)};
        fav.appendChild(document.createTextNode("Favorite"));
    } else {
        // See above comment
        fav.onclick = function() {removeFavorite(url)};
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

// Delete the queried results from the DOM
function deleteResults() {
    document.getElementById("results").innerHTML = "";
}

// Adds a new favorite Gist to localStorage. Key should be the url of the Gist (since this is
// unique) and val is the description of the Gist
function addFavorite(key, val) {
    localStorage.setItem(key, val);
    loadFavorites();
    filterResults();
}

// Removes a Gist from the list of favorites in localStorage. Key should be the url of the Gist
function removeFavorite(key) {
    localStorage.removeItem(key);
    loadFavorites();
}

// Remove any favorited Gists from the currently displayed results. A Gist should appear in either
// the results list or the favorites list, but never both
function filterResults() {
    var resultElements = document.getElementById("results").childNodes;
    for (var i = 0; i < resultElements.length; i++) {
        var url = resultElements[i].firstElementChild.href;
        if (localStorage.getItem(url) != null) {
            // The element represents a favorited Gist, and must be removed
            document.getElementById("results").removeChild(resultElements[i]);
        }
    }
}
