const seed_nr = process.env.SEEDS_NR;

const queries = [];
const usersUsed = [];
const songsUsed = [];

for (let i = 1; i <= seed_nr; i++) {
  const randUserId = Math.floor(Math.random() * seed_nr + 1);
  const randSongId = Math.floor(Math.random() * seed_nr + 1);

  if (usersUsed.indexOf(randUserId) < 0 && songsUsed.indexOf(randSongId) < 0) {
    usersUsed.push(randUserId);
    songsUsed.push(randSongId);

    const query = `INSERT INTO SONG_LIKES VALUES (song_likes_id_seq.nextval, ${randUserId}, ${randSongId})`;
    queries.push(query);
  }
}

module.exports = queries;
