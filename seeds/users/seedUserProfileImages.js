const seed_nr = process.env.SEEDS_NR;

const queries = [];

for (let i = 1; i <= seed_nr; i++) {
  const img_src =
    "https://res.cloudinary.com/dac95ck1j/image/upload/v1669241669/BD-P/ap5jwt8ip0pq0memam12.jpg";

  const query = `INSERT INTO USERPROFILE_IMAGES VALUES (${i}, '${img_src}')`;

  queries.push(query);
}

module.exports = queries;
