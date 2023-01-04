module.exports = (durationInSeconds) => {
  let playlist_minutes = Math.floor(durationInSeconds / 60);
  let playlist_seconds = durationInSeconds % 60;
  if (playlist_seconds < 10) playlist_seconds = `0${playlist_seconds}`;

  return `${playlist_minutes}:${playlist_seconds}`;
};
