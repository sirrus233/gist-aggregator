function queryGists() {
    var numRequests = 1;
    for (var i = 0; i < numRequests; i++) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {
                httpRequestCallback(request);
            }
        }
        request.open("GET", "https://api.github.com/gists/public", true);
        request.send();
    }
}

function httpRequestCallback(request) {
    console.log(request.responseText);
}
