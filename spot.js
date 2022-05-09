"use strict";
(function () {
  const BASE_URL = "https://api.spotify.com/v1/";
  const CLIENT_ID = "f1799ce82c5540c4b0d6fe8c196e654b";
  const CLIENT_SECRET = "6a43cc4881f14290a5f485e60c88bc50";
  let accessToken;

  const MAX_SEARCH_RESULTS = 5;

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
      });

    // Event handler for searching...
    let input = qs("input");

    input.addEventListener("change", () => {
      if (input.value) search(input.value);
    });

    let doneBtn = qs("#play-view > button");

    doneBtn.addEventListener("click", (e) => {
      populateScore();
      populateOrderings();
    });

    id("play-view-done").addEventListener("click", () =>
      showSection("results-view")
    );
    id("results-view-done").addEventListener("click", () =>
      showSection("search-view")
    );
  }

  /**
   * Make a request to the Spotify API for a given artist.
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
    fetch(
      `https://api.spotify.com/v1/search?type=artist&q=${name}&limit=${MAX_SEARCH_RESULTS}`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        let resultArea = id("search-results");
        resultArea.innerHTML = "";

        console.log(data);

        data.artists.items.map(buildArtistElement).map((e) => {
          resultArea.appendChild(e);
        });

        if (data.artists.items.length === 0) {
          let noArtists = document.createElement("p");
          noArtists.innerText =
            "The search didn't return any artists on Spotify; please try again.";
          resultArea.appendChild(noArtists);
        }
      });
  }

  // DOM BUILDING

  /**
   * Takes info about an album and returns a DOM element
   * representing that info.
   *
   * @param {object} info - an object as described here: https://developer.spotify.com/documentation/web-api/reference/#/operations/get-an-album
   * @return {DOMElement} The element representing that album
   */
  function buildArtistElement(info) {
    let a = document.createElement("article");
    a.addEventListener("click", () => populateArtist(info.id));

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

  function showSection(sectionId) {
    qsa("section").forEach((section) => {
      if (!("hidden" in section.classList)) {
        section.classList.add("hidden");
      }
    });
    id(sectionId).classList.remove(...id(sectionId).classList);
  }

  function sortTracksByGameIdx() {
    tracks.sort((a, b) => a.gameIdx - b.gameIdx);
  }

  function sortTracksByActualIdx() {
    tracks.sort((a, b) => a.actualIdx - b.actualIdx);
  }

  function populateTracks() {
    let resultArea = id("track-container");
    resultArea.innerHTML = "";
    sortTracksByGameIdx();
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

  function populateArtist(artistId) {
    fetch(BASE_URL + "artists/" + artistId + "/top-tracks?market=US", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        initializeTracks(data);
        populateTracks();
        showSection("play-view");
      });
  }

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

  function populateOrderings() {
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
   * Compute the normalized kendall distance between the in game ordering
   * and the proper ordering of the tracks.
   */
  function computeScore() {
    // The tracks array is in order based on gameIdx.
    // Mapping each track to the actualIdx will give the permutation
    // we want.
    let kd = kendall(tracks.map((t) => t.actualIdx));
    return 1 - (kd / (tracks.length * (tracks.length - 1))) * 2;
  }

  /**
   * Call computeScore and display the result on the page.
   */
  function populateScore() {
    let e = qs("#results-view p");
    e.textContent = (computeScore() * 100).toFixed(2) + "%";
  }

  init();
})();
