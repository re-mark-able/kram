module.exports = (oNum, places = 1, symbol = ` `, reverse = false) => {
  const num = !oNum ? 0 : oNum;
  const theString = String(num.toLocaleString(`en-US`));
  if (!reverse) {
    return theString.length <= places
      ? theString.padStart(places, symbol)
      : theString.slice(0, places);
  } else {
    return theString.length <= places
      ? theString.padEnd(places, symbol)
      : theString.slice(0, places);
  }
};
