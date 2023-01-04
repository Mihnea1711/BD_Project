const seed_nr = process.env.SEEDS_NR;

const songList = [];
for (let i = 1; i <= seed_nr; i++) {
  songList.push("song" + i);
}

const queries = [];
songList.forEach((title, index) => {
  queries.push(
    `INSERT INTO SONGS VALUES (songs_song_id_seq.nextval, '${title}', 'EDM', 250, 0, 160, 'https://res.cloudinary.com/dac95ck1j/image/upload/v1669153839/BD-P/cjkriejc4ims8ggd6vly.jpg', SYSDATE)`
  );
});

module.exports = queries;
