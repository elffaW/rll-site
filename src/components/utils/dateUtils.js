/* eslint-disable import/prefer-default-export */

const timezoneMap = {
  240: ' ET',
  300: ' CT',
  360: ' MT',
  420: ' PT',
};

/**
 * timezoneLookup takes a timezone offset as number and returns the timezone abbreviation
 * @param {number} timezoneOffset from JS Date().getTimezoneOffset() -- number representing minutes offset from GMT
 */
const timezoneLookup = (timezoneOffset) => {
  console.log('1timezoneLookup', timezoneOffset);
  if (timezoneMap[timezoneOffset]) {
    console.log('2timezoneLookup', timezoneMap[timezoneOffset]);
    return timezoneMap[timezoneOffset];
  }
  return '';
};

export { timezoneLookup };
