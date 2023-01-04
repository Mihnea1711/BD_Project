const seed_nr = process.env.SEEDS_NR;

const usernameList = [];
for (let i = 1; i <= seed_nr; i++) {
  usernameList.push("user" + i);
}

const queries = [];
usernameList.forEach((username, index) => {
  queries.push(
    `INSERT INTO USERS VALUES (users_user_id_seq.nextval, 'MihneaB', '${username}', 'parola123', 'mihnea@bejinaru.com')`
  );
});

module.exports = queries;
