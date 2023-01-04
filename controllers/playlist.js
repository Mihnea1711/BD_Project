//everything about the playlist
const executeQuery = require("../utils/ExecuteQuery");
const getAllUserDetails = require("../utils/helperFunctions/getAllUserDetails");
const getFormattedDuration = require("../utils/helperFunctions/getFormattedDuration");
const createSongsObject = require("../utils/helperFunctions/createSongsObject");
const getUserID = require("../utils/helperFunctions/getUserID");

module.exports.renderUserPlaylists = async (req, res) => {
  const { username } = req.params;

  const currentUser = await getAllUserDetails(username);

  const playlists = [];
  const stmt = `select p.playlist_id, p.title, p.length, p.nr_of_songs, 
  extract(day from p.date_created) || '-' || extract(month from date_created) || '-' || extract(year from date_created), pi.img_src
  from users u, playlists p, playlist_images pi
  where u.user_id = p.user_id and p.playlist_id = pi.playlist_id and u.user_id = (select user_id from users where username = '${username}')`;

  const result = await executeQuery(stmt);
  const data = result.rows;
  data.forEach((playlist) => {
    let length = playlist[2];
    length = getFormattedDuration(length);

    playlists.push({
      id: playlist[0],
      title: playlist[1],
      length: length,
      nrOfSongs: playlist[3],
      dateCreated: playlist[4],
      image: playlist[5],
    });
  });

  res.render("users/playlists", {
    user: currentUser,
    playlists: playlists,
  });
};

module.exports.solveCreatePlaylist = async (req, res) => {
  const { username } = req.params;
  const user = await getAllUserDetails(username);
  const profileImage = req.file;

  const { playlistTitle } = req.body;

  let playlistImagePath;
  if (profileImage) {
    playlistImagePath = profileImage.path;
  }

  const getPlaylistVals = `select playlists_playlist_id_seq.nextval, playlists_playlist_id_seq.currval from dual`;
  const playlistValues = await executeQuery(getPlaylistVals);
  const playlistNextval = playlistValues.rows[0][0];
  const playlistCurrval = playlistValues.rows[0][1];

  const createPlaylistQuery = `insert into playlists values(${playlistNextval}, '${playlistTitle}', DEFAULT, DEFAULT, ${user.id}, SYSDATE)`;
  let insertPLImageQuery;
  if (playlistImagePath) {
    insertPLImageQuery = `insert into playlist_images values(${playlistCurrval}, '${playlistImagePath}')`;
  } else {
    insertPLImageQuery = `insert into playlist_images values(${playlistCurrval}, DEFAULT)`;
  }

  executeQuery(createPlaylistQuery).then((result) => {
    if (!result) {
      req.flash("error", "Error creating the playlist...");
      return res.redirect(`/users/${username}/playlists`);
    }
    executeQuery(insertPLImageQuery).then((result) => {
      if (result) {
        req.flash("success", "Successfuly created the playlist");
        return res.redirect(`/users/${username}/playlists`);
      } else {
        req.flash("error", "Image not inserted correctly..");
        return res.redirect(`/users/${username}/playlists`);
      }
    });
  });
};

module.exports.renderUserAvailablePlaylists = async (req, res) => {
  const { username } = req.params;
  const song_id = req.query.q;

  const checkIfSongExists = `select * from songs where song_id = ${song_id}`;
  const checkResult = await executeQuery(checkIfSongExists);
  if (!checkResult) {
    req.flash("error", "An error occured while trying to reach the DB");
    return res.redirect(`/users/${username}`);
  }
  if (!checkResult.rows.length) {
    req.flash("error", "Song does not exist!");
    return res.redirect(`/users/${username}`);
  }

  const currentUserId = await getUserID(req.session.username);

  let playlists = [];
  const findPlaylistsQuery = `select p.playlist_id, p.title, pi.img_src from playlists p, playlist_images pi where p.playlist_id = pi.playlist_id and p.user_id = ${currentUserId}`;
  const playlistsResult = await executeQuery(findPlaylistsQuery);
  if (playlistsResult) {
    if (playlistsResult.rows.length) {
      for (let row of playlistsResult.rows) {
        const id = row[0];
        const title = row[1];
        const image = row[2];

        playlists.push({ id: id, title: title, image: image });
      }
    }
  }
  res.render("playlists/show", {
    song_id: song_id,
    username: username,
    playlists: playlists,
  });
};

module.exports.solveAddToSelectedPlaylist = async (req, res) => {
  const { username } = req.params;
  const { p_id, s_id } = req.query;

  const checkIfPlaylistExists = `select * from playlists where playlist_id = ${p_id}`;
  const checkResult = await executeQuery(checkIfPlaylistExists);
  if (!checkResult) {
    req.flash("error", "An error occured while trying to reach the DB");
    return res.redirect(`/users/${username}`);
  }
  if (!checkResult.rows.length) {
    req.flash("error", "Playlist does not exist!");
    return res.redirect(`/users/${username}`);
  }

  const getPlaylistStatistics = `select nr_of_songs, length from playlists where playlist_id = ${p_id}`;
  const playlistResult = await executeQuery(getPlaylistStatistics);
  let playlistSongs = 0;
  let playlistLength = 0;
  if (playlistResult) {
    playlistSongs = playlistResult.rows[0][0];
    playlistLength = playlistResult.rows[0][1];
  }

  const getSongDuration = `select duration from songs where song_id = ${s_id}`;
  const songResult = await executeQuery(getSongDuration);
  let songDuration = 0;
  if (songResult) {
    songDuration = songResult.rows[0][0];
  }

  const insertSongQuery = `insert into playlist_songs values (playlist_songs_id_seq.nextval, ${p_id}, ${s_id})`;
  const updatePlaylistSongs = `update playlists set nr_of_songs = ${
    playlistSongs + 1
  }, length = ${playlistLength + songDuration} where playlist_id = ${p_id}`;

  const insertSongResult = await executeQuery(insertSongQuery);
  if (insertSongResult) {
    const updateNrOfSongsResult = await executeQuery(updatePlaylistSongs);
    if (updateNrOfSongsResult) {
      req.flash("success", "Successfully inserted the song in the playlist");
    } else {
      req.flash(
        "error",
        "An error occured while trying to insert the song in the playlist.. Try again!"
      );
    }
  } else {
    req.flash(
      "error",
      "An error occured while trying to insert the song in the playlist.. Try again!"
    );
  }
  return res.redirect(`/users/${username}/playlists/${p_id}`);
};

module.exports.renderCreatePlaylistForm = (req, res) => {
  const { username } = req.params;

  res.render("playlists/create", { username: username });
};

module.exports.renderPlaylistContent = async (req, res) => {
  const { username, playlist_id } = req.params;

  const findPlaylistQuery = `select p.title, p.length, p.nr_of_songs, 
extract(day from p.date_created) || '-' || extract(month from date_created) || '-' || extract(year from date_created), pi.img_src
from playlists p, playlist_images pi 
where p.playlist_id = pi.playlist_id and p.playlist_id = ${playlist_id}`;

  const playlistResult = await executeQuery(findPlaylistQuery);
  let playlist = {};
  if (playlistResult) {
    if (playlistResult.rows.length) {
      playlist.id = playlist_id;
      playlist.title = playlistResult.rows[0][0];
      playlist.length = getFormattedDuration(playlistResult.rows[0][1]);
      playlist.nrOfSongs = playlistResult.rows[0][2];
      playlist.dateCreated = playlistResult.rows[0][3];
      playlist.image = playlistResult.rows[0][4];
      playlist.user = username;
    }
  }

  const findPlaylistSongsQuery = `select u.full_name, u.username, s.song_id, s.title, s.genre, s.duration, si.img_src 
from users u, songs s, artist_lists al, song_images si
where al.user_id = u.user_id and al.song_id = s.song_id and s.song_id = si.song_id and
s.song_id IN 
(select song_id
from playlist_songs
where playlist_id = ${playlist_id})
order by s.title`;

  const songsResult = await executeQuery(findPlaylistSongsQuery);
  const songs = createSongsObject(songsResult);

  res.render("playlists/overview", { playlist: playlist, songs: songs });
};

module.exports.solveEditPlaylist = async (req, res) => {
  const { username, playlist_id } = req.params;
  const { playlistTitle } = req.body;
  let playlistImagePath;
  if (req.file) {
    playlistImagePath = req.file.path;
  }

  const updatePlaylistTitleQuery = `update playlists set title = '${playlistTitle}' where playlist_id = ${playlist_id}`;

  executeQuery(updatePlaylistTitleQuery).then((result) => {
    if (!result) {
      req.flash(
        "error",
        "An error occurred while trying to update the playlist.. Try again!"
      );
      return res.redirect(`/users/${username}/playlists/${playlist_id}`);
    }
    if (playlistImagePath) {
      const updatePlaylistImageQ = `update playlist_images set img_src = '${playlistImagePath}' where playlist_id = ${playlist_id}`;
      executeQuery(updatePlaylistImageQ).then((result) => {
        if (!result) {
          req.flash(
            "error",
            "An error occurred while trying to update tte playlist image.. Try again!"
          );
          return res.redirect(`/users/${username}/playlists/${playlist_id}`);
        }
      });
    }
    req.flash("success", "Successfully updated the playlist!");
    return res.redirect(`/users/${username}/playlists/${playlist_id}`);
  });
};

module.exports.solveDeletePlaylist = async (req, res) => {
  const { username, playlist_id } = req.params;

  const deletePlaylistQuery = `delete from playlists where playlist_id = ${playlist_id}`;
  const result = await executeQuery(deletePlaylistQuery);

  if (result) {
    req.flash("success", "Successfully deleted the playlist");
    return res.redirect(`/users/${username}/playlists`);
  } else {
    req.flash(
      "error",
      "An error occured while deleting the playlist.. try again"
    );
    return res.redirect(`/users/${username}/playlists/${playlist_id}`);
  }
};

module.exports.renderEditPlaylistForm = async (req, res) => {
  const { username, playlist_id } = req.params;

  let playlist;

  const findPlaylistQuery = `select p.title, pi.img_src
  from playlists p, playlist_images pi 
  where p.playlist_id = pi.playlist_id and p.playlist_id = ${playlist_id}`;
  const result = await executeQuery(findPlaylistQuery);
  if (result) {
    if (result.rows) {
      playlist = {
        id: playlist_id,
        title: result.rows[0][0],
        image: result.rows[0][1],
      };
    }
  }

  res.render("playlists/edit", { username: username, playlist: playlist });
};

module.exports.solveRemoveSongFromPlaylist = async (req, res) => {
  const { username, playlist_id, track_id } = req.params;

  const getSongDurationQuery = `select duration from songs where song_id = ${track_id}`;
  const songDurationResult = await executeQuery(getSongDurationQuery);
  let songDuration = 0;
  if (songDurationResult) {
    if (songDurationResult.rows.length) {
      songDuration = songDurationResult.rows[0][0];
    }
  }

  const getPlaylistStatisticsQuery = `select nr_of_songs, length from playlists where playlist_id = ${playlist_id}`;
  const playlistStatsResult = await executeQuery(getPlaylistStatisticsQuery);
  const nrOfSongs = playlistStatsResult.rows[0][0];
  const length = playlistStatsResult.rows[0][1];

  const deleteQuery = `delete from playlist_songs where song_id = ${track_id} and playlist_id = ${playlist_id}`;
  const result = await executeQuery(deleteQuery);
  if (result) {
    await executeQuery(
      `update playlists set nr_of_songs = ${nrOfSongs - 1}, length = ${
        length - songDuration
      } where playlist_id = ${playlist_id}`
    );
    req.flash("success", "Successfully removed the song from the playlist...");
  } else {
    req.flash(
      "error",
      "An error occured while trying to remove the song from your playlist... Try again.."
    );
  }
  res.redirect(`/users/${username}/playlists/${playlist_id}`);
};
