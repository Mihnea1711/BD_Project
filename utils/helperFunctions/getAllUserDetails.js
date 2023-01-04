const executeQuery = require("../ExecuteQuery");

module.exports = async (username) => {
  const userQuery = `select u.full_name, u.email, upi.img_src, ubi.img_src, u.user_id
  from users u, userprofile_images upi, userbackground_images ubi
  where u.user_id = upi.user_id and u.user_id = ubi.user_id and u.user_id = 
  (select user_id from users where username = '${username}')`;

  const userData = await executeQuery(userQuery);
  const userDetails = userData.rows[0];

  const user = {
    name: userDetails[0],
    email: userDetails[1],
    profileImage: userDetails[2],
    backgroundImage: userDetails[3],
    id: userDetails[4],
    username: username,
  };

  const bioQuery = `select bio_text from bios where user_id = (select user_id from users where username = '${username}')`;
  const result = await executeQuery(bioQuery);
  if (result.rows.length) {
    user.bio = result.rows[0][0];
  } else {
    user.bio = "";
  }

  return user;
};
