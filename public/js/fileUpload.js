var csv_file;
var json_xml_file;
document.getElementById("csvFile").addEventListener("change", function (event) {
  csv_file = event.target.files[0];
});
document.getElementById("jsonXmlFile").addEventListener("change", function (event) {
    json_xml_file = event.target.files[0];
    });

    var x = document.getElementById('column1');
    var y = document.getElementById('column2');
    var z = document.getElementById('col3');
    var a = document.getElementById('output');
    x.style.visibility = 'hidden';
    y.style.visibility = 'hidden';
    z.style.visibility = 'hidden';
    //a.style.visibility = 'hidden';

    var dictionary = {}; // Initialize an empty dictionary
    var valuesArray1 = []; // Array of values for the first column
    var valuesArray2 = []; // Array of values for the second column

    function allowDrop(event) {
      event.preventDefault();
    }

    function drag(event) {
      event.dataTransfer.setData("text", event.target.id);
    }

    function drop(event) {
      event.preventDefault();
      var data = event.dataTransfer.getData("text");
      var droppedElement = document.getElementById(data);

      // Get the value and ID of the dropped element
      var value = droppedElement.innerText;
      var id = droppedElement.id;

      // Get the ID of the target column
      var targetColumnId = event.target.id;

      // Get the index of the dropped element
      var index = parseInt(id.replace("value", "")) - 1;

      // Get the value from the corresponding valuesArray based on the target column
      if (targetColumnId === "column1") {
        value = valuesArray1[index];
      } else if (targetColumnId === "column2") {
        value = valuesArray2[index];
      }

      // Update the dictionary with the associated value and key
      dictionary[targetColumnId] = value;

      event.target.appendChild(droppedElement);
    }

    var outputDict = {}; // Initialize an empty dictionary for storing the output

    function displayDictionary() {
       
    document.getElementById("output").hidden = false;
    document.getElementById("create_mapping").hidden = false;


      var outputField = document.getElementById("output");
      var csvHeaders = valuesArray1.map(function (value, index) {
        return { id: "value" + (index + 1), value: value };
      });

      var csvHeaderDictionary = {};

      csvHeaders.forEach(function (header) {
        if (dictionary[header.id]) {
          csvHeaderDictionary[header.value] = dictionary[header.id];
        }
      });

      outputField.value = JSON.stringify(csvHeaderDictionary, null, 2);

      outputDict = csvHeaderDictionary; // Store the dictionary in outputDict

      console.log(outputDict); // outputDict has the value of mapping
    }

    function processFiles() {
        var x = document.getElementById('column1');
        var y = document.getElementById('column2');
        var z = document.getElementById('col3');
        x.style.visibility = 'visible';
        y.style.visibility = 'visible';
        z.style.visibility = 'visible';

        const csvFile = csv_file;
        alert(csvFile);
        const jsonXmlFile = json_xml_file;
    //   const csvFile = document.getElementById("csvFile").files[0];
    //   const jsonXmlFile = document.getElementById("jsonXmlFile").files[0];

      const csvHeaders = [];
      const jsonKeys = [];
      const xmlFields = [];

      if (csvFile) {
        const csvReader = new FileReader();
        csvReader.onload = function (e) {
          const csvContents = e.target.result;
          const parsedData = Papa.parse(csvContents, { header: true }).data;
          csvHeaders.push(...Object.keys(parsedData[0]));
          valuesArray1 = csvHeaders; // Assign CSV headers to valuesArray1
          console.log("CSV Headers:", csvHeaders);
          // Perform further processing with the CSV headers here
          displayValues();
        };
        csvReader.readAsText(csvFile);
      }

      if (jsonXmlFile) {
        const jsonXmlReader = new FileReader();
        jsonXmlReader.onload = function (e) {
          const jsonXmlContents = e.target.result;
          const fileType = jsonXmlFile.name.split(".").pop().toLowerCase();

          if (fileType === "json") {
            const jsonData = JSON.parse(jsonXmlContents);
            const jsonKeys = Object.keys(jsonData[0]);
            valuesArray2 = jsonKeys;
            console.log("JSON Keys:", jsonKeys);
            // Perform further processing with the JSON data and keys here
            displayValues();
          } else if (fileType === "xml") {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(jsonXmlContents, "application/xml");
            const row = xmlDoc.querySelector("row");

            if (row) {
              const fields = row.getElementsByTagName("*");
              for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                xmlFields.push(field.tagName);
              }

              valuesArray2 = xmlFields;

              console.log("XML Fields:", xmlFields);
              // Perform further processing with the XML fields here
              displayValues();
            }
          } else {
            console.log("Unsupported file format.");
          }
        };
        jsonXmlReader.readAsText(jsonXmlFile);
      }
    }

    function displayValues() {
      var column1 = document.getElementById("column1");
      var column2 = document.getElementById("column2");

      // Clear existing values
      column1.innerHTML = "";
      column2.innerHTML = "";

      // Populate column 1
      for (var i = 0; i < valuesArray1.length; i++) {
        var value = valuesArray1[i];
        var pElement = document.createElement("p");
        pElement.draggable = true;
        pElement.ondragstart = drag;
        pElement.id = "value" + (i + 1);
        pElement.innerText = valuesArray1[i]; // Use the actual value from the array
        column1.appendChild(pElement);
      }

      // Populate column 2
      for (var j = 0; j < valuesArray2.length; j++) {
        var value = valuesArray2[j];
        var pElement = document.createElement("p");
        pElement.draggable = true;
        pElement.ondragstart = drag;
        pElement.id = "value" + (j + 1 + valuesArray1.length);
        pElement.innerText = valuesArray2[j]; // Use the actual value from the array
        column2.appendChild(pElement);
      }
    }



let dropAreas = document.querySelectorAll(".drag-image");

dropAreas.forEach((dropArea) => {
  let dragText = dropArea.querySelector("h6");
  let button = dropArea.querySelector("button");
  let input = dropArea.querySelector("input");
  let file;

  button.onclick = () => {
    input.click();
  };

  input.addEventListener("change", function () {
    file = this.files[0];
    dropArea.classList.add("active");
    viewfile(dropArea);
  });

  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("active");
    dragText.textContent = "Release to Upload File";
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    file = event.dataTransfer.files[0];
    viewfile(dropArea);
  });

  function viewfile(dropArea) {
    let fileType = file.type;
    let validExtensions = ["text/csv", "application/json", "application/xml"];
    if (validExtensions.includes(fileType)) {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        let fileData = fileReader.result;
        dropArea.innerHTML = '<p>' + file.name + '</p>';
      };
      fileReader.readAsDataURL(file);
    }
  }
});