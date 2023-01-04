const seed_nr = process.env.SEEDS_NR;

const queries = [];

for (let i = 1; i <= seed_nr; i++) {
  const img_src =
    "https://res.cloudinary.com/dac95ck1j/image/upload/v1669242019/BD-P/o74yctufijbo3mu735kn.png";

  const query = `INSERT INTO PLAYLIST_IMAGES VALUES (${i}, '${img_src}')`;

  queries.push(query);
}

module.exports = queries;
