const executeQuery = require("../utils/ExecuteQuery");
const createSongsObject = require("../utils/helperFunctions/createSongsObject");
const getFormattedDuration = require("../utils/helperFunctions/getFormattedDuration");

module.exports.renderSearchAllPage = (req, res) => {
  const searchQuery = req.query.q;
  const searchKey = searchQuery.toLowerCase();

  //should render all results matching the query
  //too much sql query

  res.send("Search everything");
  //   res.render("search/tracks", { searchQuery });
};

module.exports.solveSearchButton = (req, res) => {
  //should redirect to everything page with the query string of the search key
  //instead we redirect to tracks
  const { searchKey } = req.body;
  res.redirect(`/search/tracks?q=${searchKey}`);
};

module.exports.renderSearchTracksPage = async (req, res) => {
  //show matching tracks from dbs
  const searchQuery = req.query.q;
  let searchKey;
  if (searchQuery) {
    searchKey = searchQuery.toLowerCase();
  } else {
    searchKey = "";
  }

  const query = `select u.full_name, u.username, s.song_id, s.title, s.genre, s.duration, si.img_src 
  from users u, songs s, artist_lists al, song_images si
  where al.user_id = u.user_id and al.song_id = s.song_id and s.song_id = si.song_id and LOWER(s.title) like '%${searchKey}%'
  order by s.title`;

  const matchingSongsResult = await executeQuery(query);

  const tracks = createSongsObject(matchingSongsResult);

  res.render("search/tracks", { searchQuery: searchQuery, tracks: tracks });
};

module.exports.renderSearchPeoplePage = async (req, res) => {
  // show matching user full names from db
  const searchQuery = req.query.q;
  const searchKey = searchQuery.toLowerCase();

  const query = `select u.full_name, u.username, upi.img_src
  from users u, userprofile_images upi
  where u.user_id = upi.user_id and LOWER(u.full_name) like '%${searchKey}%'`;

  const result = await executeQuery(query);
  const resultTable = result.rows;

  const users = [];
  for (let row of resultTable) {
    const fullname = row[0];
    const username = row[1];
    const profile_img = row[2];

    users.push({
      fullname: fullname,
      username: username,
      profile_img: profile_img,
    });
  }

  res.render("search/people", { searchQuery: searchQuery, users: users });
};

module.exports.renderSearchPlaylistsPage = async (req, res) => {
  //afisam /playlist cu nume asemanator
  // Aici afisam rezultatele cautarii cu search bar dupa playlist-uri
  const searchQuery = req.query.q;
  const searchKey = searchQuery.toLowerCase();

  const query = `select p.playlist_id, p.title, p.length, p.nr_of_songs, pi.img_src,
    extract(day from p.date_created) || '-' || extract(month from date_created) || '-' || extract(year from date_created), 
    (select username from users where user_id = p.user_id) as username, 
    (select full_name from users where user_id = p.user_id) as fullname
    from playlists p, playlist_images pi
    where p.playlist_id = pi.playlist_id and LOWER(p.title) like '%${searchKey}%'`;

  const result = await executeQuery(query);
  const resultTable = result.rows;

  const playlists = [];

  resultTable.forEach((row) => {
    const playlist_id = row[0];
    const title = row[1];
    const length = getFormattedDuration(row[2]);
    const nr_of_songs = row[3];
    const image = row[4];
    const date_created = row[5];
    const username = row[6];
    const fullname = row[7];

    playlists.push({
      playlist_id: playlist_id,
      title: title,
      date_created: date_created,
      length: length,
      nr_of_songs: nr_of_songs,
      image: image,
      username: username,
      fullname: fullname,
    });
  });

  res.render("search/playlists", {
    searchQuery: searchQuery,
    playlists: playlists,
  });
};
