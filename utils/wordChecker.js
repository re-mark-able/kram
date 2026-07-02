const NSpell = require(`nspell`);
const ucWords = require(`../utils/ucWords`);
const logger = require(`../utils/logger`);
const WordNet = require("node-wordnet");
const wordnet = new WordNet();

module.exports = async (word) => {
  let return_output = false;

  try {
    const definitions = await wordnet.lookupAsync(word.toLowerCase());

    if (definitions.length > 0) {
      return_output = definitions[0].gloss;
    }
  } catch (e) {
    logger.error(e, `DICTIONARY WORDNET error`);
  }

  if (!return_output) {
    const en = await import(`dictionary-en`);
    const spell = NSpell([en.default]);

    return_output = spell.correct(word); // Check given case
    if (!return_output) {
      return_output = spell.correct(word.toLowerCase()); // check lower case
    }
    if (!return_output) {
      return_output = spell.correct(ucWords(word));
    }

    if (!return_output) {
      const validateURL = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;

      try {
        const res = await fetch(validateURL, {
          method: `GET`,
        });
        const results = await res.json();

        if (results && results.length > 0 && results[0]) {
          return_output = results[0].meanings[0].definitions[0].definition;
        }
      } catch (err) {
        logger.error(err, `DICTIONARY API Word check error`);
      }
    }

    if (!return_output) {
      const validateURL = `https://freedictionaryapi.com/api/v1/entries/en/${word.toLowerCase()}?translations=true`;

      try {
        const res = await fetch(validateURL, {
          method: `GET`,
        });
        const results = await res.json();

        if (results && results.entries.length > 0 && results.entries[0]) {
          return_output = "Unable to get definition";
        }
      } catch (err) {
        logger.error(err, `DICTIONARY FINAL Word check error`);
        return false;
      }
    }
  }
  return return_output;
};
