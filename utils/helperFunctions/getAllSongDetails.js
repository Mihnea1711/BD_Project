const executeQuery = require("../ExecuteQuery");

module.exports = async (track_id) => {
  const trackQuery = `select u.username, u.full_name, s.title, s.genre, s.duration, s.link, s.likes, s.bpm,
    extract(day from s.date_published) || '-' || extract(month from s.date_published) || '-' || extract(year from s.date_published), si.img_src 
    from users u, songs s, artist_lists al, song_images si 
    where u.user_id = al.user_id and al.song_id = s.song_id and s.song_id = si.song_id and s.song_id = ${track_id} 
    order by s.title`;

  const songResult = await executeQuery(trackQuery);

  let song = {};

  if (songResult) {
    const title = songResult.rows[0][2];
    const genre = songResult.rows[0][3];
    const duration = songResult.rows[0][4];
    const link = songResult.rows[0][5];
    const likes = songResult.rows[0][6];
    const bpm = songResult.rows[0][7];
    const datePublished = songResult.rows[0][8];
    const imgSrc = songResult.rows[0][9];

    song = {
      id: track_id,
      title: title,
      genre: genre,
      duration: duration,
      link: link,
      likes: likes,
      bpm: bpm,
      datePublished: datePublished,
      imgSrc: imgSrc,
      artists: [],
    };

    for (let row of songResult.rows) {
      const username = row[0];
      const fullname = row[1];
      song.artists.push({ username: username, fullname: fullname });
    }
  }
  return song;
};
