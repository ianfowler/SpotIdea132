"use strict";
(function () {
  const BASE_URL = "https://api.spotify.com/v1/";
  const CLIENT_ID = "f1799ce82c5540c4b0d6fe8c196e654b";
  const CLIENT_SECRET = "6a43cc4881f14290a5f485e60c88bc50";
  let accessToken;

  const MAX_SEARCH_RESULTS = 5;

  let tracks;

  /**
   * Sets up the game, getting an access token and registering event handlers.
   *
   * Objectives:
   *  -  call and wait for the completion of getAccessToken().
   *  -  Add an event listener to the search bar which calls the searchArtists
   *     function with the value inside the searchBar if there is a value
   *     inside the searchBar.
   *  -  Populate the results-view and show the results view when the done
   *     button in play-view is clicked.
   *  -  Show search-view when the done button in results-view is clicked.
   */
  async function init() {
    await getAccessToken();

    let searchBar = qs("input");
    searchBar.addEventListener("change", () => {
      if (searchBar.value) searchArtists(searchBar.value);
    });

    id("play-view-done").addEventListener("click", () => {
      populateResults();
      showSection("results-view");
    });

    id("results-view-done").addEventListener("click", () =>
      showSection("search-view")
    );
  }

  /**
   * Uses the 'token' Spotify API endpoint following the Client Credentials flow.
   * https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/
   *
   * Objectives:
   *  -  Use await on a call to fectch.
   *  -  Format a POST request with the CLIENT_ID and CLIENT_SECRET.
   *  -  Extract the access token and set the global variable "accessToken".
   *  -  Use helper methods checkStatus and handleError.
   *
   * @param {string} name - name of the artist
   */
  async function getAccessToken() {
    await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })
      .then(checkStatus)
      .then((response) => response.json())
      .then((data) => {
        // Once we receive the access token we store it in a global...
        accessToken = data.access_token;
      })
      .catch(handleError);
  }

  /**
   * Uses the 'search' Spotify API endpoint:
   * https://developer.spotify.com/documentation/web-api/reference/#/operations/search
   *
   * Objectives:
   *  -  Format a URL for the request. name is passed as a parameter
   *     to the method. Limit the number of search results with the query
   *     parameter limit and the global constant MAX_SEARCH_RESULTS.
   *  -  Pass in the access token in the Authorization header to authenticate
   *     the request.
   *  -  After recieving the data, populate artists on the DOM using
   *     buildArtistSearchResults.
   *  -  Use helper methods checkStatus and handleError.
   *
   * @param {string} name - name of the artist
   */
  function searchArtists(name) {
    name = encodeURIComponent(name);

    fetch(
      `https://api.spotify.com/v1/search?type=artist&q=${name}&limit=${MAX_SEARCH_RESULTS}`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    )
      .then(checkStatus)
      .then((response) => response.json())
      .then(buildArtistSearchResults)
      .catch(handleError);
  }

  // Segue between views
  /**
   * TODO: MORE DESCRIPTIVE DOCS
   *
   * @param {string} sectionId
   */
  function showSection(sectionId) {
    qsa("section").forEach((section) => {
      if (!("hidden" in section.classList)) {
        section.classList.add("hidden");
      }
    });
    id(sectionId).classList.remove(...id(sectionId).classList);
  }

  // Artist
  /**
   * TODO: MORE DESCRIPTIVE DOCS
   *
   * @param {*} data
   */
  function buildArtistSearchResults(data) {
    let resultArea = id("search-results");
    resultArea.innerHTML = "";

    data.artists.items.map(buildArtistSearchResult).map((e) => {
      resultArea.appendChild(e);
    });

    if (data.artists.items.length === 0) {
      let noArtists = document.createElement("p");
      noArtists.innerText =
        "The search didn't return any artists on Spotify; please try again.";
      resultArea.appendChild(noArtists);
    }
  }

  /**
   * TODO: MORE DESCRIPTIVE DOCS (maybe give a comment on structure in HTML)
   * Takes info about an album and returns a DOM element
   * representing that info.
   *
   * @param {object} info - an object as described here: https://developer.spotify.com/documentation/web-api/reference/#/operations/get-an-album
   * @return {DOMElement} The element representing that album
   */
  function buildArtistSearchResult(info) {
    let a = document.createElement("article");
    a.addEventListener("click", () => fetchArtistTopTracks(info.id));

    let img = document.createElement("img");
    if (info.images[0]) {
      img.src = info.images[0].url;
    }
    img.alt = info.name;

    let title = document.createElement("h3");
    title.textContent = info.name;

    a.appendChild(img);
    a.appendChild(title);

    return a;
  }

  /**
   * TODO: MORE DESCRIPTIVE DOCS
   * Takes info about a track and returns a DOM element
   * representing that info.
   *
   * @param {object} track - item from "tracks" global. See "initializeTracks".
   * @return {DOMElement} The element representing the track
   */
  function buildTrack(track) {
    let a = document.createElement("article");

    let h3 = document.createElement("h3");
    h3.textContent = track.name;
    a.appendChild(h3);

    let btnContainer = document.createElement("div");

    let upBtn = document.createElement("button");
    upBtn.textContent = "Up";
    upBtn.addEventListener("click", () => moveTrackUp(track.gameIdx));
    btnContainer.appendChild(upBtn);

    let downBtn = document.createElement("button");
    downBtn.textContent = "Down";
    downBtn.addEventListener("click", () => moveTrackDown(track.gameIdx));
    btnContainer.appendChild(downBtn);

    a.appendChild(btnContainer);
    return a;
  }

  /**
   * Sorts the global variable "tracks" by the property "gameIdx".
   * Sort in ascending order.
   * This will modify the array in-place; nothing has to be returned.
   * Hint: this can be done in one simple line.
   */
  function sortTracksByGameIdx() {
    tracks.sort((a, b) => a.gameIdx - b.gameIdx);
  }

  /**
   * Sorts the global variable "tracks" by the property "actualIdx".
   * Sort in ascending order.
   * This will modify the array in-place; nothing has to be returned.
   * Hint: this can be done in one simple line.
   */
  function sortTracksByActualIdx() {
    tracks.sort((a, b) => a.actualIdx - b.actualIdx);
  }

  /**
   * Adds tracks represented in the global variable "tracks" to the
   * div with id "track-container".
   *
   * Objectives:
   *  -  Clear the tracks already in "track-container"
   *  -  In the order of game index, add an element to
   *     "track-container" for each track. Use buildTrack.
   */
  function populateTracks() {
    let resultArea = id("track-container");
    resultArea.innerHTML = "";
    sortTracksByGameIdx();
    tracks.map(buildTrack).map((e) => {
      resultArea.appendChild(e);
    });
  }

  /**
   * Handles the up button on a track.
   * Switches elements in the "tracks" variable then rebuilds the DOM.
   * @param {Number} currentGameIdx - game index of track related to event
   */
  function moveTrackUp(currentGameIdx) {
    if (currentGameIdx === 0) return;
    const tempTrack = {
      ...tracks[currentGameIdx - 1],
      gameIdx: currentGameIdx,
    };
    tracks[currentGameIdx - 1] = {
      ...tracks[currentGameIdx],
      gameIdx: currentGameIdx - 1,
    };
    tracks[currentGameIdx] = tempTrack;
    populateTracks();
  }

  /**
   * Handles the down button on a track.
   * Switches elements in the "tracks" variable then rebuilds the DOM.
   * @param {Number} currentGameIdx - game index of track related to event
   */
  function moveTrackDown(currentGameIdx) {
    if (currentGameIdx === tracks.length - 1) return;
    const tempTrack = {
      ...tracks[currentGameIdx + 1],
      gameIdx: currentGameIdx,
    };
    tracks[currentGameIdx + 1] = {
      ...tracks[currentGameIdx],
      gameIdx: currentGameIdx + 1,
    };
    tracks[currentGameIdx] = tempTrack;
    populateTracks();
  }

  /**
   * Uses the 'top-tracks' Spotify API endpoint:
   * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-an-artists-top-tracks
   *
   * Objectives:
   *  -  Format a URL for the request. artistId is passed as a parameter
   *     to the method. Target the US market by setting the query
   *     parameter market=US.
   *  -  Pass in the access token in the Authorization header to authenticate
   *     the request.
   *  -  After recieving the data, set the global tracks variable with
   *     initializeTracks, populate the tracks on the DOM, then show
   *     the section "play-view"
   *  -  Use helper methods checkStatus and handleError.
   *
   * @param {string} artistId - Spotify ID of the artist
   */
  function fetchArtistTopTracks(artistId) {
    fetch(BASE_URL + "artists/" + artistId + "/top-tracks?market=US", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then(checkStatus)
      .then((response) => response.json())
      .then((data) => {
        initializeTracks(data);
        populateTracks();
        showSection("play-view");
      })
      .catch(handleError);
  }

  /**
   * Using the data from the top-tracks endpoint, sets the
   * global "tracks" variable as an array with the following objects:
   *
   *   [
   *     {
   *       "name" : string representing the name of the track,
   *       "actualIdx" : number representing the order the track appears
   *                     in the top ten
   *       "gameIdx" : number representing the position in which the user has
   *                   placed the track.
   *     }
   *   ]
   *
   * @param {Object} info - Data from fetchArtistTopTracks()
   */
  function initializeTracks(info) {
    const topTen = info.tracks;
    let gameIdxs = [...Array(topTen.length).keys()];
    gameIdxs.sort(() => Math.random() - 0.5);
    tracks = topTen.map((track, idx) => {
      return {
        name: track.name,
        actualIdx: idx,
        gameIdx: gameIdxs[idx],
      };
    });
  }

  /**
   * Populates the results-view with a final score and lists of expected
   * vs actual top ten rankings.
   *
   * Objectives:
   *  -  Format the result of computeScore() as a percentage.
   *     Populate this result as the content of the paragraph in results-view.
   *  -  Populate the ol with id "actual-ordering" with list items
   *     representing the names of tracks. Ensure elements are inserted in
   *     order of the artist's top ten (sortTracksByActualIdx is helpful).
   *  -  Populate "your-ordering" in the same way, but in the order the user
   *     provided (sortTracksByGameIdx is helpful).
   *
   */
  function populateResults() {
    let scoreboard = qs("#results-view p");
    scoreboard.textContent = (computeScore() * 100).toFixed(2) + "%";

    let actual = id("actual-ordering");
    actual.innerHTML = "";
    sortTracksByActualIdx();
    tracks.map((track) => {
      let li = document.createElement("li");
      li.textContent = track.name;
      actual.appendChild(li);
    });

    let user = id("your-ordering");
    user.innerHTML = "";
    sortTracksByGameIdx();
    tracks.map((track) => {
      let li = document.createElement("li");
      li.textContent = track.name;
      user.appendChild(li);
    });
  }

  /**
   * Helper function to return the Response object if successful, otherwise
   * throws an Error with an error status and corresponding text.
   * @param {Response} response - response object to check for success/error
   * @returns {object} - Response if status code is ok (200-level)
   */
  function checkStatus(response) {
    if (!response.ok) {
      throw Error("Error in request: " + response.statusText);
    }
    return response; // a Response object
  }

  /**
   * Displays an error message on the page, hiding any previous results.
   * If errMsg is passed as a string, that string is used to customize an error message.
   * Otherwise (the errMsg is an object or missing), a generic message is displayed.
   * @param {String} errMsg - optional specific error message to display on page.
   */
  function handleError(errMsg) {
    if (typeof errMsg === "string") {
      id("message-area").textContent = errMsg;
    } else {
      // the err object was passed, don't want to show it on the page;
      // instead use generic error message.
      id("message-area").textContent =
        "An error ocurred fetching the launch data";
    }
    id("message-area").classList.remove("hidden");
  }

  /**
   * Compute the normalized kendall distance between the in game ordering
   * and the proper ordering of the tracks.
   * @returns {Number} - Score between 0 (worst) and 1 (best)
   */
  function computeScore() {
    // The tracks array is in order based on gameIdx.
    // Mapping each track to the actualIdx will give the permutation
    // we want.
    return 1 - kendall(tracks.map((t) => t.actualIdx));
  }

  init();
})();
