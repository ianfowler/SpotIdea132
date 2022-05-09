/**
 * Potential starter code for Spotify assignment.
 * I marked things I'm currently unsure of with TODO.
 */

(function() {
  "use strict";

  // Probly best to just have students use a single
  // client. Alternative would be to have them each set up their
  // own on the Spotify dashboard, but you need an account and
  // I woudln't want to require anyone to make one.

  const BASE_URL = "https://api.spotify.com/v1/";
  const CLIENT_ID = "f1799ce82c5540c4b0d6fe8c196e654b";
  const CLIENT_SECRET = "6a43cc4881f14290a5f485e60c88bc50";

  // Access token required for requests.
  //
  // TODO: What should happen if a request needs to be made
  // before this is populated?
  let accessToken;

  // List of tracks to sort while playing the game.
  let tracks;

  /**
   * Requests an access token from Spotify using the above
   * client information.
   * 
   * Fills the accessToken global.
   *
   * TODO: I added this so that we could potentially delay registering
   *       handlers until we have a valid access token...
   *
   * @return {Promise} a promise which is fulfilled after the
   *                   access token is filled.
   */
  function getAccessToken() {
    return fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })
      .then((response) => response.json())
      .then((data) => {
        // Once we receive the access token we store it in a global...
        accessToken = data.access_token;
      });
  }

  /**
   * Make call to request access token and register event
   * handlers.
   */
  function init() {
    getAccessToken()
      .then(() => {
        let input = qs("input");
        input.addEventListener("change", (e) => {
          albumSearch(input.value);
        });

        qs("#play-view > button").addEventListener("click", finishGame);
      });
  }

  /**
   * Move a track up in the game.
   *
   * This should be registered as the click event handler
   * for the move up button.
   *
   * TODO: Not certain how this should be implemented...
   *       I feel like there's a way to do it without rebuilding
   *       the entire DOM.
   * TODO: YEP!
   */
  function moveTrackUp() {
    let trackElement = this.parentElement.parentElement;
    let container = trackElement.parentElement;
    let above = trackElement.previousSibling;

    if (!above)
      return;

    container.insertBefore(container.removeChild(trackElement), above);
  }

  /**
   * Move a track down in the game.
   *
   * This should be registered as the click event handler
   * for the move down button.
   *
   * TODO: Not certain how this should be implemented...
   *       I feel like there's a way to do it without rebuilding
   *       the entire DOM.
   * TODO: YEP!
   */
  function moveTrackDown() {
    let trackElement = this.parentElement.parentElement;
    let container = trackElement.parentElement;
    let below = trackElement.nextSibling;

    if (!below)
      return;

    container.insertBefore(container.replaceChild(trackElement, below), trackElement);
  }

  /**
   * Take info about an album and return a DOM element representing
   * that album.
   *
   * @param {object} info - album object as described in
   *                        the Spotify Web API reference
   *
   * @return {Element} the element representing the album
   */
  function buildAlbumElement(info) {
    let a = document.createElement("article");
    a.addEventListener("click", () => { startGame(info); });

    let img = document.createElement("img");
    img.src = info.images[0].url;
    img.alt = "album art";

    let title = document.createElement("h3");
    title.textContent = info.name;

    let artist = document.createElement("p");
    artist.textContent = info.artists[0].name;

    let trackCount = document.createElement("p");
    trackCount.textContent = info.total_tracks + " Tracks";

    a.appendChild(img);
    a.appendChild(title);
    a.appendChild(artist);
    a.appendChild(trackCount);

    return a;
  }

  /**
   * Take info about a track and return a DOM element representing
   * that track.
   *
   * These are the elements that will be moved around during the game.
   *
   * TODO: It may be helpful to give these elements an id using the
   *       actual spotify track id...
   *       That way the track can be looked up in the tracks list.
   *
   * @param {object} info - track object as described in
   *                        the Spotify Web API reference
   *
   * @return {DOM element} the element representing the track
   */
  function buildGameTrackElement(info) {
    let a = document.createElement("article");

    let h3 = document.createElement("h3");
    h3.textContent = info.name;
    a.appendChild(h3);

    let btnContainer = document.createElement("div");

    let upBtn = document.createElement("button");
    upBtn.textContent = "Up";
    upBtn.addEventListener("click", moveTrackUp);
    btnContainer.appendChild(upBtn);

    let downBtn = document.createElement("button");
    downBtn.textContent = "Down";
    downBtn.addEventListener("click", moveTrackDown);
    btnContainer.appendChild(downBtn);

    a.appendChild(btnContainer);
    return a;
  }

  /**
   * Take info about a track and return a DOM element representing
   * that track.
   *
   * These are the elements that should be shown in the comparison.
   *
   * @param {object} info - track object as described in
   *                        the Spotify Web API reference
   *
   * @return {DOM element} the element representing the track
   */
  function buildTrackComparisonElement(info) {
    let li = document.createElement("li");
    li.textContent = info.name;
    return li;
  }

  /**
   * Make a search request to the Spotify API for an album
   * given the query text.
   *
   * Add the results to the page when the response is
   * received.
   *
   * @param {string} query - the search text
   *
   * @return {Promise} a promise which is fulfilled after the
   *                   search results are added to the page
   */
  function albumSearch(query) {
    // Prepare to use query in a URI query param
    query = encodeURIComponent(query);

    // We search by making a request to this endpoint
    // We tell it we want albums and give it the query
    fetch(BASE_URL + `search?type=album&q=${query}`, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
    .then((response) => response.json())
    .then((data) => {
      let resultArea = id("search-results");
      resultArea.innerHTML = "";
      data.albums.items
        .filter((album) => album.total_tracks > 1)
        .map(buildAlbumElement)
        .map((e) => {
          resultArea.appendChild(e);
        });
    });
  }

  /**
   * Make a request for complete track objects for a given
   * album.
   *
   * @param {object} album - album object as described in
   *                         the Spotify Web API reference
   *
   * @return {Promise} a promise that resolves with the array
   *                   of tracks
   */
  function getFullTracksFromAlbum(album) {
    // The references specifies 50 uris max...
    // Im not checking... are there any albums that big?
    return fetch(BASE_URL + `albums/${album.id}/tracks`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      })
      .then((response) => response.json())
      .then((data) => data.items)
      .then((tracks) => tracks.map((t) => t.id).join(","))
      .then((ids) => fetch(`${BASE_URL}tracks?ids=${ids}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }))
      .then((response) => response.json())
      .then((data) => data.tracks);
  }

  /**
   * Start the game for a given album.
   *
   * Must use the getFullTracksFromAlbum to get popularity info
   *
   * Should set the tracks global variable.
   *
   * Should add the track game elements to the page in a random
   * order.
   *
   * @param {object} album - album object as described in
   *                         the Spotify Web API reference
   */
  function startGame(album) {
    getFullTracksFromAlbum(album)
    .then(shuffle)
    .then((ts) => { tracks = ts; return tracks; })
    .then((tracks) => tracks.map(buildGameTrackElement))
    .then((elements) => {
      let trackArea = id("track-container");
      trackArea.innerHTML = "";
      elements.map((e) => { trackArea.appendChild(e) });
    });
  }

  /**
   * TODO: maybe this is not useful...
   *
   * Compute the normalized kendall distance between the player's
   * ordering of the tracks and the proper ordering.
   *
   * The score should be 100% - (normalized kendall dist)
   *
   * @return {number} the player's score
   */
  function computeScore() {
  }

  /**
   * End the game and show the results.
   *
   * Should add the track comparison elements to the page.
   *
   * Should display the player's score.
   *
   * One list of comparison elements for the player's ordering
   * and one for the proper ordering.
   */
  function finishGame() {
    // Add the index of each track in the player's ordering
    // to the track objects.
    tracks.forEach((t,i) => { t.playerOrder = i; });

    let user = id("your-ordering");
    user.innerHTML = "";
    tracks.map(buildTrackComparisonElement).forEach((t) => { user.appendChild(t); });

    // Sort tracks according to popularity for proper ordering.
    tracks.sort((a, b) => b.popularity - a.popularity);

    let actual = id("actual-ordering");
    actual.innerHTML = "";
    tracks.map(buildTrackComparisonElement).forEach((t) => { actual.appendChild(t); });

    // TODO: I think I should add the normalization to the kendall function...
    let kd = kendall(tracks.map((t) => t.playerOrder));
    let score = 1-(kd / (tracks.length * (tracks.length - 1))) * 2;

    let e = qs("#results-view p");
    e.textContent = (score * 100).toFixed(2) + "%";
  }

  init();

})();
