const seed_nr = process.env.SEEDS_NR;

const queries = [];
const usersUsed = [];
const songsUsed = [];

for (let i = 1; i <= seed_nr; i++) {
  let randUserId = Math.floor(Math.random() * seed_nr + 1);
  let randSongId = Math.floor(Math.random() * seed_nr + 1);

  while (
    usersUsed.indexOf(randUserId) > 0 &&
    songsUsed.indexOf(randSongId) > 0
  ) {
    randUserId = Math.floor(Math.random() * seed_nr + 1);
    randSongId = Math.floor(Math.random() * seed_nr + 1);
  }

  usersUsed.push(randUserId);
  songsUsed.push(randSongId);

  const query = `INSERT INTO ARTIST_LISTS VALUES (artist_lists_id_seq.nextval, ${randUserId}, ${randSongId})`;
  queries.push(query);
}

module.exports = queries;
