const csv = require('csvtojson');

const readData = (filePath) => {
  return csv().fromFile(filePath);
}

const getData = async (filePath) => {
  const fileData = await readData(filePath);
  const eighty_percent = Math.floor(fileData.length * 0.8);
  const train_data = fileData.slice(0, eighty_percent);
  const test_data = fileData.slice(eighty_percent + 1, fileData.length);
  return {
    train_data,
    test_data
  };
}

module.exports = getData;
