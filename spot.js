"use strict";
(function () {
  const BASE_URL = "https://api.spotify.com/v1/";
  const CLIENT_ID = "f1799ce82c5540c4b0d6fe8c196e654b";
  const CLIENT_SECRET = "6a43cc4881f14290a5f485e60c88bc50";
  let accessToken;

  let tracks;

  function init() {
    // We make a POST request to this endpoint to get an 'accessToken'
    // based on the client information...
    // (I had to set this up on the developer dashboard)

    fetch("https://accounts.spotify.com/api/token", {
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

        getAlbumInfo();
      });

    // Event handler for searching...
    let input = qs("input");

    input.addEventListener("change", (e) => {
      searchArtist(input.value);
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
    let a = document.createElement("article");

    let img = document.createElement("img");
    img.src = info.images[0].url;
    img.alt = "album art";

    let title = document.createElement("h2");
    title.textContent = info.name;

    a.appendChild(img);
    a.appendChild(title);

    return a;
  }

  /**
   * Make a request to the Spotify API for albums by the given
   * artist.
   *
   * Use the response to build the album elements on the page...
   *
   * @param {string} name - name of the artist
   */
  function searchArtist(name) {
    // We search by making a request to this endpoint.
    // We tell it we want albums and to filter by artist name...
    // We may just want to directly pass the query instead of filtering by artist...
    // TODO: we will need to URL encode the query... i havent done that yet...
    fetch(`https://api.spotify.com/v1/search?type=album&q=artist:${name}`, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        let resultArea = id("search-results");
        resultArea.innerHTML = "";
        data.albums.items.map(buildAlbumElement).map((e) => {
          resultArea.appendChild(e);
        });
      });
  }

  // Functions to grab info from album data
  function getAlbumName(album) {
    return album.name;
  }

  function getArtistsDescription(album) {
    return album.artists.map((item) => item.name).join(", ");
  }

  function getReleaseYear(album) {
    const release_date = new Date(album.release_date);
    return release_date.getFullYear();
  }

  function getTracks(album) {
    const tracks = album.tracks.items;
    let gameIdxs = [...Array(tracks.length).keys()];
    gameIdxs.sort(() => Math.random() - 0.5);

    return tracks.map((track, idx) => {
      return {
        name: track.name,
        actualIdx: idx,
        gameIdx: gameIdxs[idx],
      };
    });
  }

  function getAlbumImageSrc(album) {
    return album.images[0].url;
  }

  function buildTrackElement(track) {
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

  function sortTracksByGameIdx() {
    tracks.sort((a, b) => a.gameIdx - b.gameIdx);
  }

  function populateTracks() {
    let resultArea = id("track-container");
    resultArea.innerHTML = "";
    sortTracksByGameIdx();
    console.log(tracks);
    tracks.map(buildTrackElement).map((e) => {
      resultArea.appendChild(e);
    });
  }

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

  // Pixies 0DQyTVcDhK9wm0f6RaErWO
  function getAlbumInfo() {
    let url = BASE_URL + "albums/";
    let albumId = "0DQyTVcDhK9wm0f6RaErWO";
    url += albumId;

    fetch(url, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        tracks = getTracks(data);
        populateTracks();
      });
  }

  init();
})();
