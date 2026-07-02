module.exports = (string) => {
  const newString = string.replaceAll(`_`, ` `);
  const theWords = newString.split(` `);
  const returnWords = [];
  theWords.forEach((word) =>
    returnWords.push(word[0].toUpperCase() + word.substring(1)),
  );
  return returnWords.join(` `);
};
