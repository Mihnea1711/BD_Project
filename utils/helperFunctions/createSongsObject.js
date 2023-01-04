const getFormattedDuration = require("./getFormattedDuration");

module.exports = (queryResult) => {
  let songs = {};
  if (queryResult) {
    if (queryResult.rows.length) {
      for (let row of queryResult.rows) {
        const fullname = row[0];
        const username = row[1];
        const author = username;
        const songId = row[2];
        const songTitle = row[3];
        const songGenre = row[4];
        const songDuration = getFormattedDuration(row[5]);
        const songImage = row[6];

        const songInfo = {
          title: songTitle,
          genre: songGenre,
          duration: songDuration,
          image: songImage,
          artists: [{ fullname: fullname, username: username }],
          author: author,
        };

        if (!songs[songId]) {
          songs[songId] = songInfo;
        } else {
          const oldRecord = songs[songId];
          const newRecord = {
            title: oldRecord.title,
            genre: oldRecord.genre,
            duration: oldRecord.duration,
            image: oldRecord.image,
            artists: [
              ...oldRecord.artists,
              { fullname: fullname, username: username },
            ],
            author: oldRecord.author,
          };
          songs[songId] = newRecord;
        }
      }
    }
  }

  return songs;
};
