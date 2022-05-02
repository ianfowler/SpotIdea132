"use strict";
(function () {
  BASE_URL + "https://api.spotify.com/v1";

  function init() {
    let startBtn = id("start-btn");
    let backBtn = id("back-btn");
    startBtn.addEventListener("click", toggleView);
    backBtn.addEventListener("click", toggleView);
  }

  init();
})();
