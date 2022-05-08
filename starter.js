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
  }

  /**
   * Make call to request access token and register event
   * handlers.
   */
  function init() {
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
   */
  function moveTrackUp() {
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
   */
  function moveTrackDown() {
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
  }

  /**
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
  }

})();
