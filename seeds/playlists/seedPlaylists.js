const seed_nr = process.env.SEEDS_NR;

const queries = [];

for (let i = 1; i <= seed_nr; i++) {
  const randUserId = Math.floor(Math.random() * seed_nr + 1);

  const query = `INSERT INTO PLAYLISTS VALUES (playlists_playlist_id_seq.nextval, 'PlaylistTitle', 0, 0, ${randUserId}, SYSDATE)`;

  queries.push(query);
}

module.exports = queries;
