module.exports = (colourString) => {
  const colour = `${!colourString.charAt(0) !== "#" ? "#" : ""}${colourString}`;
  return /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(colour);
};
