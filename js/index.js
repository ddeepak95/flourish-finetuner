// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

var loadFileBtn = document.querySelector(".modal .modal-btn");
loadFileBtn.disabled = "true";
var validation = document.getElementById("validation-text");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];


var timingFileUploadBtn = document.getElementById("inputTimingfile");
timingFileUploadBtn.disabled = "true";
var audioFileUploadBtn = document.getElementById("audio_file");
audioFileUploadBtn.disabled = "true";
// When the user clicks the button, open the modal 
btn.onclick = function () {
  modal.style.display = "block";
}
window.addEventListener('load', (event) => {
  modal.style.display = "block";
});
// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
// window.onclick = function (event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }

var timingFilename = "enter"

var header = [
];

var timings = [];


// // Chapters
// var chapters = [{ start: 1, end: 15 }];
// var hasIntro = true;
// var baseRef = "C01-03-B003-";

//Parse Files
var outputTextArray = [];
document.getElementById('inputPhrasefile')
  .addEventListener('change', function () {

    var fr = new FileReader();
    fr.onload = function () {
      parsePhraseFileContent(fr.result);
    }

    fr.readAsText(this.files[0]);
  })
document.getElementById('inputTimingfile')
  .addEventListener('change', function () {

    var fr = new FileReader();
    fr.onload = function () {
      try {
        parseTimingFileContent(fr.result);

      }
      catch (e) {
        validation.innerText = "Invalid Phrase File";
      }
    }

    fr.readAsText(this.files[0]);
    timingFilename = this.files[0].name;
  })

function parsePhraseFileContent(text) {
  try {
    tContent = text;
    const result = tContent.split('\n');
    result.forEach(element => {
      var contents = element.split('|');
      if (contents[0] != "") {
        var lineObj = {
          label: contents[0],
          phrase: contents[1].replace('\r', '')
        };
        outputTextArray.push(lineObj);
      }
    }
    );
    timingFileUploadBtn.removeAttribute("disabled");
    validation.innerText = "";
  }
  catch (e) {
    validation.innerText = "Invalid Phrase File";
  }
}

function parseTimingFileContent(text) {
  try {
    tContent = text;
    const result = tContent.split('\n');
    var tArrayLength = outputTextArray.length;
    console.log(outputTextArray);
    var resultNew = result.filter(Boolean);
    console.log(resultNew);
    var resultArrayLength = resultNew.length;
    console.log(tArrayLength + " === " + resultArrayLength);
    if (tArrayLength == resultArrayLength) {
      for (var i = 0; i < tArrayLength; i++) {
        var timingLine = resultNew[i].split('	');
        var label = timingLine[2].replace('\r', '');
        if (outputTextArray[i].label === label) {
          outputTextArray[i].start = timingLine[0];
          outputTextArray[i].end = timingLine[1];
        }
      }
    }
    else {
      throw "Invalid File";
    }
    console.log(outputTextArray);
    timings = outputTextArray;
    validation.innerText = "";
    audioFileUploadBtn.removeAttribute("disabled");
  }
  catch {
    validation.innerText = "Invalid Timing File";
  }
}

audio_file.onchange = function () {
  try {
    var files = this.files;
    var file = URL.createObjectURL(files[0]);
    audio.src = file;
    loadFileBtn.removeAttribute("disabled");
    validation.innerHTML = "<span style='color: green;'> Files Validated Successfully!</span>"
  }
  catch {
    validation.innerText = "Invalid Audio";
  }
};

function loadTextToUI() {
  console.log("Loading Text");
  var pop = Popcorn("#audio");
  initFineTuneTimingsTable(timings);
  initPopcorn(pop, timings);
  modal.style.display = "none";
}