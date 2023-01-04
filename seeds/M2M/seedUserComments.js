const seed_nr = process.env.SEEDS_NR;

const queries = [];

for (let i = 1; i <= seed_nr; i++) {
  const randUserId = Math.floor(Math.random() * seed_nr + 1);
  const randSongId = Math.floor(Math.random() * seed_nr + 1);

  const comment = "This is a comment!";

  const query = `INSERT INTO USER_COMMENTS VALUES (user_comments_id_seq.nextval, ${randUserId}, ${randSongId}, '${comment}')`;
  queries.push(query);
}

module.exports = queries;
