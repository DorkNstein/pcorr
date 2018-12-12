const csv = require('csvtojson');

const readData = () => {
  return csv()
      .fromFile(__dirname + "/insurance.csv")
      .then((jsonObj) => {
		return jsonObj;
      })
}

const getData = async () => {
  const fileData = await readData();
  const eighty_percent = Math.floor(fileData.length * 0.8);
  const train_data = fileData.slice(0, eighty_percent);
  const test_data = fileData.slice(eighty_percent + 1, fileData.length);
  return {
    train_data,
    test_data
  };
}

module.exports = getData;
