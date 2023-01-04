module.exports = (firstName, lastName) => {
  return (
    firstName
      .split(" ")
      .filter((name) => name !== "")
      .map((name) => name[0].toUpperCase() + name.slice(1))
      .join(" ") +
    " " +
    lastName
      .split(" ")
      .filter((name) => name !== "")
      .join("")[0]
      .toUpperCase() +
    lastName
      .split(" ")
      .filter((name) => name !== "")
      .join("")
      .slice(1)
  );
};
