const fs = require('fs');
const { convertCSVToArray } = require('convert-csv-to-array');

const readData = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + "/kc_house_data_1.csv", opts = 'utf8', (err, fileData) => {
      if (err) {
        console.log("Error:\n", err);
        reject(err);
	  }
	//   console.log('fileData :', fileData);
      resolve(fileData);
    });
  })
}

const getData = async () => {
  const fileData = await readData();
  const convertedData = convertCSVToArray(fileData, {
    separator: ',', // use the separator you use in your csv (e.g. '\t', ',', ';' ...)
  });

  const eighty_percent = Math.floor(convertedData.length * 0.8);
//   console.log("test", convertedData[6]);
  const train_data = convertedData.slice(1, eighty_percent);
  const test_data = convertedData.slice(eighty_percent + 1, convertedData.length);
  return {
	  train_data,
	  test_data
  };
}

module.exports = getData;
