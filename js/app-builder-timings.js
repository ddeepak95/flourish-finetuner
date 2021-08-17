// App Builder Fine Tune Timing Functions 
// Requires jQuery, Popcorn and Mousetrap plugins

// Initially based on finetuneas by Firat Özdemir
// https://github.com/ozdefir/finetuneas
// See here for MIT license: https://github.com/ozdefir/finetuneas/blob/master/LICENSE

var currentRow = -1;
var lastAdjustTime = 0;
var lastAdjustRow  = -1;

const SCROLL_INTO_VIEW = false;
const BUTTON_TOOLTIPS  = false;

function secondsToHms(seconds) {
	d = Number(seconds);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);
	var ms = Math.round((seconds % 1) * 100);
	if (ms == 100) {
		ms = 0;
		s += 1;
	}
	return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s + "." + (ms < 10 ? "0" : "") + ms); 
}

function changeTiming(row, change) {
	if (change > 0) {
		increase(row, change);
	}
	else {
		decrease(row, -change);
	}
	
	// Keep track of the row we are adjusting
	lastAdjustRow = row;
	lastAdjustTime = new Date();
}

function increase(row, change) {
	timings[row].start = Math.round((timings[row].start + change) * 100) / 100;
	
	if (row > 0) {
		// Update end time of previous row
		timings[row-1].end = timings[row].start;
		updateFootnoteForTiming(timings[row-1]);
	}
	
	updateRow(row, timings[row]);
	
	// Check that next row is after current row
	var r = row + 1;
	while (r < timings.length) {
		if (timings[r].start < timings[row].start) {
			// Update start time of next row
			timings[r].start = timings[row].start + 1;
			updateFootnoteForTiming(timings[r]);
			
			if (r > 0) {
				// Update end time of previous row
				timings[r-1].end = timings[r].start;
				updateFootnoteForTiming(timings[r-1]);
			}
			
			updateRow(r, timings[r]);
		}
		r++;
	}
	
	playFromTimingStart(timings[row]);
}

function decrease(row, change) {
	timings[row].start = Math.round((timings[row].start - change) * 100) / 100;
	
	var prevRowStart = (row > 0) ? timings[row-1].start : 0;
	if (timings[row].start < prevRowStart) {
		timings[row].start = (row > 0) ? prevRowStart + 0.1 : 0;
	}
	
	if (row > 0) {
		// Update end time of previous row
		timings[row-1].end = timings[row].start;
		updateFootnoteForTiming(timings[row-1]);
	}

	updateRow(row, timings[row]);
	playFromTimingStart(timings[row]);
}

function updateRow(row, timing) {
	document.getElementById(row + 'Start').innerHTML = secondsToHms(timing.start);
	updateFootnoteForTiming(timing);
}

function playFromTimingStart(timing) {	
	var audio = $('#audio');
	audio[0].currentTime = timing.start;
	audio[0].play();
}
			
function initFineTuneTimingsTable(timings) {
	var table = document.createElement("table");
	table.className = "timings";
	var content = document.getElementById("content");
	content.appendChild(table);
	
	// Column widths
	var colgroup = document.createElement("colgroup");
	table.appendChild(colgroup);
	var col = document.createElement("col");
	col.span = 1;
	col.style.width = "10%";
	colgroup.appendChild(col);

	var col = document.createElement("col");
	col.span = 1;
	col.style.width = "70%";
	colgroup.appendChild(col);

	var col = document.createElement("col");
	col.span = 1;
	col.style.width = "10%";
	colgroup.appendChild(col);

	var col = document.createElement("col");
	col.span = 1;
	col.style.width = "10%";
	colgroup.appendChild(col);
	
	// Table Headers
	var tr = document.createElement("tr");
	tr.className = "timing-row-header";
	table.appendChild(tr);

	var td1 = document.createElement("td");
	td1.className = "timing-cell-header";
	td1.innerHTML = "Label";
	tr.appendChild(td1);

	var td2 = document.createElement("td");
	td2.className = "timing-cell-header";
	td2.innerHTML = "Phrase";
	tr.appendChild(td2);
		
	var td3 = document.createElement("td");
	td3.className = "timing-cell-header";
	td3.innerHTML = "Start Time";
	tr.appendChild(td3);

	var td4 = document.createElement("td");
	td4.className = "timing-cell-header";
	td4.innerHTML = "Move Back";
	tr.appendChild(td4);

	var td5 = document.createElement("td");
	td5.className = "timing-cell-header";
	td5.innerHTML = "Move Forward";
	tr.appendChild(td5);

	// Write each row to table
	$.each(timings, function(i) {
		var tr = document.createElement("tr");
		tr.id = "Row" + this.label;
		tr.className = "timing-row";
		table.appendChild(tr);

		var td1 = document.createElement("td");
		td1.id = i + "Label";
		td1.className = "timing-cell";
		td1.innerHTML = this.label;
		tr.appendChild(td1);

		var td2 = document.createElement("td");
		td2.id = i + "Phrase";
		td2.className = "timing-cell";
		tr.appendChild(td2);
		
		var span = document.createElement("span");
		span.innerHTML = this.phrase;
		td2.appendChild(span);
		
		var td3 = document.createElement("td");
		td3.id = i + "Start";
		td3.className = "timing-cell";
		td3.innerHTML = secondsToHms(this.start);
		tr.appendChild(td3);

		var td4 = document.createElement("td");
		td4.className = "timing-cell";
		
		var buttonDecMore  = makeButton(i, -1.0, "&ndash;&nbsp;&ndash;", "Back 1 sec");
		var buttonDecSmall = makeButton(i, -0.1, "&ndash;", "Back 0.1 sec");
		
		td4.innerHTML = "<div class='timing-buttons'>" + buttonDecMore + "&nbsp;" + buttonDecSmall + "</div>";
		tr.appendChild(td4);

		var td5 = document.createElement("td");
		td5.className = "timing-cell";
		
		var buttonIncSmall = makeButton(i, 0.1, "+", "Forward 0.1 sec");
		var buttonIncMore  = makeButton(i, 1.0, "++", "Forward 1 sec");
		
		td5.innerHTML = "<div class='timing-buttons'>" + buttonIncSmall + "&nbsp;" + buttonIncMore + "</div>";
		tr.appendChild(td5);
	});

	$('.timing-cell').click(function() {
		var audio = $('#audio');
		
		if (!isEmpty(this.id)) {
			var row = parseFloat(this.id);
			audio[0].currentTime = timings[row].start;
			audio[0].play();
		}
	});
	
	// Save button
	addSaveButton("button-save");
	
    // Keyboard shortcuts
	// Space bar: toggle play/pause audio
    Mousetrap.bind('space', _toggleAudioPlayPause);
	
	// Adjust timings on current row
    Mousetrap.bind('a', _back1);
    Mousetrap.bind('q', _back1);
    Mousetrap.bind('s', _backPoint1);
    Mousetrap.bind('d', _forwardPoint1);	
    Mousetrap.bind('f', _forward1);	
	
	// Back/Previous rows
	Mousetrap.bind('n', _gotoNextRow);	
	Mousetrap.bind('p', _gotoPreviousRow);
	
	// Set closest start time
	Mousetrap.bind('b', _setClosestStartTime);
	
	// Save Timings
	Mousetrap.bind('t', saveTimingsToFile);
}

function addSaveButton(buttonId) {
    var btn = document.createElement("button");
	btn.id = buttonId;
	btn.type = "submit";
	btn.innerHTML = "Save Changes to Timing File";
	content.appendChild(btn);
	btn.onclick = function() { saveTimingsToFile(); };
}

function saveTimingsToFile() {
	var lines = [];
	var lineIndex = 0;
	
	// Header
	for (i = 0; i < header.length; i++) {
		lines[lineIndex] = "\\" + header[i].marker + " " + header[i].content;
		lineIndex++;
	}
	
	// Timings
	for (i = 0; i < timings.length; i++) {
		lines[lineIndex] = timings[i].start + "\t" + timings[i].end + "\t" + timings[i].label;
		lineIndex++;
	};
	
	var text = lines.join("\r\n");	
	var filename = timingFilename;
	var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
	saveAs(blob, filename);
}

function _toggleAudioPlayPause() {
   var audio = document.getElementById("audio");
   
   if (audio != document.activeElement) {
	   if (audio.paused) {
		  audio.play();
	   } 
	   else { 
		  audio.pause();
	   }
   }
   return false;
}

function _gotoNextRow() {
	var audio = $('#audio');
	var row = (currentRow >= 0) ? currentRow + 1 : 0;
	audio[0].currentTime = timings[row].start;
	audio[0].play();
}

function _gotoPreviousRow() {
	var audio = $('#audio');
	var row = (currentRow > 0) ? currentRow - 1 : 0;
	audio[0].currentTime = timings[row].start;
	audio[0].play();
}

function _back1() {
   if (currentRow >= 0) {
	   var row = _getRowToAdjust();
       changeTiming(row, -1.0);
   }
   return false;	
}

function _backPoint1() {
   if (currentRow >= 0) {
	   var row = _getRowToAdjust();
       changeTiming(row, -0.1);
   }
   return false;	
}

function _forward1() {
   if (currentRow >= 0) {
	   var row = _getRowToAdjust();
       changeTiming(row, 1.0);
   }
   return false;	
}

function _forwardPoint1() {
   if (currentRow >= 0) {
	   var row = _getRowToAdjust();
       changeTiming(row, 0.1);
   }
   return false;	
}

function _getRowToAdjust() {
	// If key press is less than a second since the last one, return the last adjusted row
    var now = new Date();
	var row = (now - lastAdjustTime > 1000) ? currentRow : lastAdjustRow;
	return row;
}

function _setClosestStartTime() {
	var row = (currentRow > 0) ? currentRow : 0;
	var audio = $('#audio');
	var currentTime = audio[0].currentTime;

	var rowToChange;
    var currentRowStart = timings[row].start;	
	var timeFromCurrentRowStart = currentTime - currentRowStart;

    if (row + 1 < timings.length) {
	   var nextRowStart = timings[row + 1].start;
	   var timeToNextRowStart = nextRowStart - currentTime;
	
		if (timeFromCurrentRowStart < timeToNextRowStart) {
			// We are towards the start of this row
			rowToChange = row;
		}
		else {
			// We are towards the end of this row
			rowToChange = row + 1;
		}
    }
	else {
		rowToChange = row;
	}
	
	if (rowToChange > 0) {
	    timings[rowToChange - 1].end = currentTime;
	    updateFootnoteForTiming(timings[rowToChange - 1]);
	}
	
	timings[rowToChange].start = currentTime;
	updateRow(rowToChange, timings[rowToChange]);
}

function makeButton(row, change, caption, tooltip) {
	var spanTip = BUTTON_TOOLTIPS ? "<span class='button-tooltip'>" + tooltip + "</span>" : "";
	return "<button class='timing-button' onclick='changeTiming(" + row + ", " + change + ")'>" +              caption + spanTip + "</button>";
}

function addFootnoteForTiming(timing) {
	var pop = Popcorn.instances[0];
	
	// Highlight timing row between start/end times
	pop.footnote({
		start: timing.start,
		end: timing.end,
		text: '',
		target: "Row" + timing.label,
		effect: "applyclass",
		applyclass: "selected"
	});

	// Save footnote event id
	var id = pop.getLastTrackEventId();
	timing.footnoteId = id;
}

function removeFootnoteForTiming(timing) {
	if (timing.footnoteId) {
		var pop = Popcorn.instances[0];
		pop.removeTrackEvent(timing.footnoteId);
	}
}

function updateFootnoteForTiming(timing) {
	removeFootnoteForTiming(timing);
	addFootnoteForTiming(timing);
}

function initPopcorn(pop, timings) {
	$.each(timings, function(i) {
		addFootnoteForTiming(this);
		
		// Scroll element into view
		pop.code({
			start: this.start,
			end: this.end,
			
			label: this.label,
			row: i,
			
			onStart: function( options ) {
				currentRow = options.row;
				
				if (SCROLL_INTO_VIEW) {
					var thisRow = $("#Row" + options.label);
					if (thisRow.position()) {
						var top    = thisRow.position().top;
						var height = thisRow.height();
						var windowHeight = window.innerHeight || document.documentElement.clientHeight;
						var topToolbarHeight    = $("#toolbar-top").height();
						var bottomToolbarHeight = $("#toolbar-bottom").height();

						if ((top < $(window).scrollTop() + topToolbarHeight) ||
							(top + height > $(window).scrollTop() + windowHeight - topToolbarHeight - bottomToolbarHeight - 30)) {
							$('html,body').animate({scrollTop:top - topToolbarHeight - 30}, 1000);
						}
					}
				}
			},
			
			onEnd: function( options ) {
			   ;
			}
		});
	});
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function onAudioSpeedChange() {
	var speed = document.getElementById("audio-speed").value;
	var audio = document.getElementById("audio");
	audio.playbackRate = speed;
}


