"use strict";
(function () {
  const clientId = 'f1799ce82c5540c4b0d6fe8c196e654b';
  const clientSecret = '6a43cc4881f14290a5f485e60c88bc50';
  let accessToken;

  function init() {
    // We make a POST request to this endpoint to get an 'accessToken'
    // based on the client information...
    // (I had to set this up on the developer dashboard)
    
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    .then(response => response.json())
    .then((data) => {
      // Once we receive the access token we store it in a global...
      accessToken = data.access_token;
    })
    
    // Event handler for searching...
    let input = qs("input");

    input.addEventListener('change', (e) => {
      search(input.value);
    });
  }

  /**
   * Takes info about an album and returns a DOM element
   * representing that info.
   *
   * @param {object} info - an object as described here: https://developer.spotify.com/documentation/web-api/reference/#/operations/get-an-album
   * @return {DOMElement} The element representing that album
   */
  function buildAlbumElement(info) {
    let a = document.createElement('article');

    let img = document.createElement('img');
    img.src = info.images[0].url;
    img.alt = "album art";

    let title = document.createElement('h2');
    title.textContent = info.name;

    let artist = document.createElement('p');
    artist.textContent = info.artists[0].name;

    let trackCount = document.createElement('p');
    trackCount.textContent = info.total_tracks + ' Tracks';

    a.appendChild(img);
    a.appendChild(title);
    a.appendChild(artist);
    a.appendChild(trackCount);

    return a;
  }

  /**
   * Make a request to the Spotify API for albums by the given
   * artist.
   *
   * Use the response to build the album elements on the page.
   *
   * @param {string} name - name of the artist
   */
  function search(name) {
    // Prepare to use name in a URI query param
    name = encodeURIComponent(name);

    // We search by making a request to this endpoint
    // We tell it we want albums and give it the query
    fetch(`https://api.spotify.com/v1/search?type=album&q=${name}`, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })
    .then(response => response.json())
    .then(data => {
      let resultArea = id('search-results');
      resultArea.innerHTML = "";
      data.albums.items
        .map(buildAlbumElement)
        .map((e) => {
          resultArea.appendChild(e);
        });
    })
  }

  init();
})();
