module.exports = (duration) => {
  const returnString = [];
  for (const [period, amount] of Object.entries(duration[`$d`])) {
    if (period !== `milliseconds` && amount > 0) {
      returnString.push(
        `${amount}${period === `seconds` && duration[`$d`].milliseconds > 0 ? `.` + duration[`$d`].milliseconds.toString().slice(0, 2) : ``}${period === `months` ? `mth` : period.charAt(0)}`,
      );
    }
  }
  return returnString.join(``);
};
