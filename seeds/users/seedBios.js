const seed_nr = process.env.SEEDS_NR;

const queries = [];

for (let i = 1; i <= seed_nr; i++) {
  const bio =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa voluptate expedita porro culpa aliquid.";

  const query = `INSERT INTO BIOS VALUES (${i}, '${bio}')`;

  queries.push(query);
}

module.exports = queries;
