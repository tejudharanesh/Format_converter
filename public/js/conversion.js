let csv_file;
let format;
let output;
let xmlHeader;
let xmlData;
let Mapping = '';
let template = '';

var templateareaa = document.getElementById("template_area");
var mapping_areaa = document.getElementById("mapping_area");

// headerMapping = { Id: 'Roll', Name: 'SirName', Age: 'DOB', Gender: 'Sex' }
// const headerMapping = JSON.parse(document.getElementById('mapping_area'));
// console.log("Received header mapping"+ headerMapping);
//Replace Headers and Convert
const reader = new FileReader();

reader.onload = function (e) {
  const csv = e.target.result;
  console.log(csv);
  console.log(Mapping);
  if(format == "JSON"){
    output = convertCsvToJson(csv);
    console.log(output);
  }
  else if(format == "XML"){
    console.log(template);
    output = convertCsvToXml(csv);
    console.log(typeof(output));
    output=output.replace("undefined","");
    output=output.replaceAll("<root>","");
    output=output.replaceAll("</root>","");
    output='<root>' + output + '</root>';
    console.log(output);
  }
};
// var textarea = document.getElementById('template_area');
// textarea.addEventListener('input', function() {
//   var text = textarea.value;
//   console.log("Line 24:",text);
// });

// templateareaa.addEventListener('input', function() {
//   var text = templateareaa.value;
//   console.log(text);
// });
//Download Json Function

// function csvTojson
function convertCsvToJson(csvData) {
  console.log(typeof(csvData));
  console.log(csvData);
  csvData = csvData.replace(/[\r]/gm, '');
  const rows = csvData.trim().split("\n");
  rows.forEach((row) => {
    row = row.replace('\r','');
  });
  const headers = rows.shift().split(",");
  console.log(rows);
  console.log(headers);
  const json = [];

  rows.forEach((row) => {
    const rowData = row.split(",");
    console.log(template);
    console.log(typeof(template));
    console.log(Mapping);
    console.log(typeof(Mapping));
    //var jsonString = JSON.stringify(template);
    var jsonStringg = JSON.parse(template);
    console.log("Template String:",jsonStringg);
    
    
    const rowObject = JSON.parse(JSON.stringify(jsonStringg)); // Clone the template object

    headers.forEach((header, index) => {
      const mappedProperty = Mapping[header];

      if (mappedProperty) {
        const propertyPath = mappedProperty.split(".");
        let currentObject = rowObject;

        propertyPath.forEach((property, i) => {
          if (i === propertyPath.length - 1) {
            currentObject[property] = rowData[index];
          } else {
            if (!currentObject[property]) {
              if (propertyPath[i + 1].match(/^\d+$/)) {
                currentObject[property] = [];
              } else {
                currentObject[property] = {};
              }
            }
            currentObject = currentObject[property];
          }
        });
      }
    });
    json.push(rowObject);
  });
  console.log(JSON.stringify(json,null,2));
  console.log(json);
  console.log(typeof(json));
  return JSON.stringify(json,null,2);
}

function convertCsvToXml(csvData) {
  let data;
  csvData = csvData.replace(/[\r]/gm, '');
  const rows = csvData.trim().split('\n');
  const headers = rows.shift().split(',');
  console.log(rows);
  console.log(headers);

  const parser = new DOMParser();
  const templateDoc = parser.parseFromString(template, "text/xml");

  rows.forEach(row => {
      const rowData = row.split(',');

      // Clone the XML template for each row
      const xmlDoc = templateDoc.cloneNode(true);
      const rootElement = xmlDoc.documentElement;

      headers.forEach((header, index) => {
          const mappedElement = Mapping[header];

          if (mappedElement) {
              const elementPath = mappedElement.split('.');

              let currentElement = rootElement;
              elementPath.forEach((element, i) => {
                  const elements = currentElement.getElementsByTagName(element);
                  if (elements.length > 0) {
                      currentElement = elements[0];
                  } else {
                      const newElement = xmlDoc.createElement(element);
                      currentElement.appendChild(newElement);
                      currentElement = newElement;
                  }

                  if (i === elementPath.length - 1) {
                      currentElement.textContent = rowData[index];
                  }
              });
          }
      });

      const serializer = new XMLSerializer();
      const xmlData = serializer.serializeToString(xmlDoc);
      //console.log(xmlData);
      data += xmlData
      // Alternatively, you can store the XML data in an array or object for further processing
      // xmlDataArray.push(xmlData);
  });
  return data;
}

function downloadJsonFile(jsonString, filename) {
  console.log(typeof(jsonString));
  console.log(jsonString);
  const data = {
    filename: filename,
    json: jsonString
  };
  fetch("/users/fileUpload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })



  const blob = new Blob([jsonString], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function downloadXmlFile(xmlString, filename) {

  console.log(typeof(xmlString));
  console.log(xmlString);
  const data = {
    filename: filename,
    json: xmlString
  };
  fetch("/users/fileUpload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  const blob = new Blob([xmlString], { type: "application/xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

// document.addEventListener("DOMContentLoaded", function () {
//   const radioButtons = document.querySelectorAll(
//     'input[type="radio"][name="format"]'
//   );

//   radioButtons.forEach(function (radioButton) {
//     radioButton.addEventListener("change", function (event) {
//       format = event.target.value;
//       console.log("Selected format:", format);

//       // new_mapping = getElementById('dropdown');
//       // console.log("new mapping" + new_mapping);

//       headerMapping = JSON.parse(document.getElementById('mapping_area').value);
//       // headerMapping = JSON.parse(headerMapping);
//       console.log("Received header mapping",headerMapping);
//       console.log("Selected format:", format);

//       // Update the HTML element with the updated text
//       document.getElementById("myText").textContent = format;
//     });
//   });
// });

document.getElementById("csvFile").addEventListener("change", function (event) {
  csv_file = event.target.files[0];

  if (csv_file) {
    console.log("Selected file:", csv_file);
  } else {
    console.log("No file selected");
  }
});

document.getElementById("submit").addEventListener("click", function (event) {
  let sentence = document.getElementById('submit').value;
  format = sentence.trim().split(/\s+/).pop();
  event.preventDefault(); // Prevent the default form submission
  template = templateareaa.value;
  Mapping = JSON.parse(mapping_areaa.value);
  reader.readAsText(csv_file);
  // const headerMapping = JSON.parse(document.getElementById('mapping_area'));
  // console.log("Received header mapping"+ headerMapping);
});

document.getElementById("downloadButton").addEventListener("click", function () {
  console.log(format);
  console.log(typeof(output));
    if (format == "JSON") {
      console.log("Inside json download");
      const jsonString = output; // Replace this with your actual JSON string
      const filename = "data.json";

      downloadJsonFile(jsonString, filename);
    } else if (format == "XML") {
      xmlString = output;
      const filename = "data.xml";

      downloadXmlFile(xmlString, filename);
    }
  });




// let csv_file;
// let csvFileName;
// let format;
// let updatedJSON;
// let xmlHeader;
// let xmlData;
// let headerMapping;

// // headerMapping = { Id: 'Roll', Name: 'SirName', Age: 'DOB', Gender: 'Sex' }
// // const headerMapping = JSON.parse(document.getElementById('mapping_area'));
// // console.log("Received header mapping"+ headerMapping);
// //Replace Headers and Convert

// const reader = new FileReader();
// reader.onload = function (e) {
//   const csv = e.target.result;

//   const parsedData = Papa.parse(csv, { header: true }).data;
//   const updatedData = parsedData.map((row) => {
//   const updatedRow = {};
//   for (const oldHeader in row) {
//     if (row.hasOwnProperty(oldHeader)) {
//       const newHeader = headerMapping[oldHeader];
//       updatedRow[newHeader] = row[oldHeader];
//     }
//   }
//     return updatedRow;
//   });

//   const updatedCSV = Papa.unparse(updatedData);
//   console.log(updatedCSV);

//   // Convert to JSON
//   if (format == "json") {
//     updatedJSON = JSON.stringify(updatedData, null, 2);
//     console.log(updatedJSON);
//   }
//   // Convert to XML
//   if (format == "xml") {
//     xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
//     xmlData = "<root>\n";
//     updatedData.forEach((row) => {
//       xmlData += "  <row>\n";
//       Object.entries(row).forEach(([key, value]) => {
//         xmlData += `    <${key}>${value}</${key}>\n`;
//       });
//       xmlData += "  </row>\n";
//     });
//     xmlData += "</root>";
//     console.log(xmlHeader + xmlData);
//   }
// };
// //Download Json Function
// function downloadJsonFile(jsonString, filename) {
//   console.log(typeof(jsonString));
//   console.log(jsonString);
//   const data = {
//     filename: filename,
//     json: jsonString
//   };
//   fetch("/users/fileUpload", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(data)
//   })

//   const blob = new Blob([jsonString], {
//     type: "application/json;charset=utf-8",
//   });
//   const url = URL.createObjectURL(blob);

//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename;
//   link.click();

//   URL.revokeObjectURL(url);
// }

// function downloadXmlFile(xmlString, filename) {

//   fetch("/users/fileUpload", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: xmlString
//   })

//   const blob = new Blob([xmlString], { type: "application/xml" });
//   const url = URL.createObjectURL(blob);

//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename;
//   link.click();

//   URL.revokeObjectURL(url);
// }

// document.addEventListener("DOMContentLoaded", function () {
//   const radioButtons = document.querySelectorAll(
//     'input[type="radio"][name="format"]'
//   );

//   radioButtons.forEach(function (radioButton) {
//     radioButton.addEventListener("change", function (event) {
//       format = event.target.value;
//       console.log("Selected format:", format);

//       // new_mapping = getElementById('dropdown');
//       // console.log("new mapping" + new_mapping);
      
//       headerMapping = JSON.parse(document.getElementById('mapping_area').value);
//       // headerMapping = JSON.parse(headerMapping);
//       console.log("Received header mapping",headerMapping);
//       console.log("Selected format:", format);

//       // Update the HTML element with the updated text
//       document.getElementById("myText").textContent = format;
//     });
//   });
// });

// document.getElementById("csvFile").addEventListener("change", function (event) {
//   csv_file = event.target.files[0];
//   const name = event.target.files[0].name;
//   var lastIndex = name.lastIndexOf(".");
//   csvFileName = name.substring(0, lastIndex);

//   if (csv_file) {
//     console.log("Selected file:", csv_file);
//   } else {
//     console.log("No file selected");
//   }
// });

// document.getElementById("submit").addEventListener("click", function (event) {
//   event.preventDefault(); // Prevent the default form submission
//   reader.readAsText(csv_file);
//   // const headerMapping = JSON.parse(document.getElementById('mapping_area'));
//   // console.log("Received header mapping"+ headerMapping);
// });

// document.getElementById("downloadButton").addEventListener("click", function () {
//   if (format == "json") {
//     console.log("Inside json download");
//     const jsonString = updatedJSON; // Replace this with your actual JSON string
//     const filename = csvFileName+".json";

//     downloadJsonFile(jsonString, filename);
//   } 
//   else if (format == "xml") {
//     xmlString = xmlHeader + xmlData;
//     const filename = csvFileName+".xml";

//     downloadXmlFile(xmlString, filename);
//   }
// });


// document.addEventListener('DOMContentLoaded', function() {
//   const radioContainer = document.getElementById("radioContainer");
  
//   // Assume you have an array of options retrieved from the backend
//   const options = ["Option 1", "Option 2", "Option 3"];
  
//   // Add new data to the options array (e.g., retrieved from a new data source)
//   // Example: options.push("Option 4");

//   // Clear previous options
//   radioContainer.innerHTML = "";
  
//   // Create and append radio buttons for each option
//   options.forEach((option) => {
//     const label = document.createElement("label");
//     const radio = document.createElement("input");
//     radio.type = "radio";
//     radio.name = "options";
//     radio.value = option;
    
//     label.appendChild(radio);
//     label.appendChild(document.createTextNode(option));
//     radioContainer.appendChild(label);
//   });
// });