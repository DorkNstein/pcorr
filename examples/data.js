const fs = require('fs');
const { convertCSVToArray } = require('convert-csv-to-array');

const readData = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + "/kc_house_data.csv", opts = 'utf8', (err, fileData) => {
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

  const data = convertedData.slice(1, convertedData.length);
  return data;
}

module.exports = getData;
