"use strict";
(function () {
  function init() {
    let startBtn = id("start-btn");
    let backBtn = id("back-btn");
    startBtn.addEventListener("click", toggleView);
    backBtn.addEventListener("click", toggleView);
  }

  init();
})();
