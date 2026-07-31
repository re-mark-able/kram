const { tmdbToken } = require("./config");
const logger = require("./logger");

module.exports = {
  imgURLprefix: `https://image.tmdb.org/t/p/original/`,
  searchByID: async (id, search_type = "movie") => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${search_type}/${id}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${tmdbToken}`,
          },
        },
      );
      const json = await res.json();

      return json;
    } catch (e) {
      logger.error(e, "TMDB FETCH ERROR");
      return null;
    }
  },
  search: async (search_string, search_type = "movie") => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/${search_type}?include_adult=false&language=en-US&page=1&query=${search_string}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${tmdbToken}`,
          },
        },
      );
      const json = await res.json();
      if (json.results.length < 1) return [];
      const results = json.results;
      results.sort(
        (b, a) =>
          parseInt(
            !a.first_air_date
              ? a.release_date.split("-")[0]
              : a.first_air_date.split("-")[0],
          ) -
          parseInt(
            !b.first_air_date
              ? b.release_date.split("-")[0]
              : b.first_air_date.split("-")[0],
          ),
      );
      return results;
    } catch (e) {
      logger.error(e, "TMDB FETCH ERROR");
      return [];
    }
  },
};
