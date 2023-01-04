const seed_nr = process.env.SEEDS_NR;

const queries = [];
const playlistsUsed = [];
const songsUsed = [];

for (let i = 1; i <= seed_nr; i++) {
  const randPlaylistId = Math.floor(Math.random() * seed_nr + 1);
  const randSongId = Math.floor(Math.random() * seed_nr + 1);

  if (
    playlistsUsed.indexOf(randPlaylistId) < 0 &&
    songsUsed.indexOf(randSongId) < 0
  ) {
    playlistsUsed.push(randPlaylistId);
    songsUsed.push(randSongId);

    const query = `INSERT INTO PLAYLIST_SONGS VALUES (playlist_songs_id_seq.nextval, ${randPlaylistId}, ${randSongId})`;
    queries.push(query);
  }
}

module.exports = queries;
