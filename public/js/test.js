//Make sure there is a file selected
function validateForm() {
    var filename = $('#file_name').val();
    var file = $('#select_file').val();
    if ((filename == null || filename == '') && (file == null || file == '')) {
        alert('A file must be selected');
        return false;
    }
	return true;
}

/** Start PDF stuff **/
var currPage = 1;
var numPages = 0;
var thePDF = null;
//TODO: set pdfScale based on screen size?
//This should never be an issue because the pdf zooms with the page if the user zooms in/out (e.g. CTRL +/-)
var pdfScale = 1;

PDFJS.disableStream = true;

//Begin processing the pdf
$(window).on('load', function() {

    //Load the pdfAsArray from the ejs
	PDFJS.getDocument(pdfAsArray).then(function(pdf) {
		thePDF = pdf;
		
		numPages = pdf.numPages;
		
		pdf.getPage(currPage).then(handlePages);
	});
});

//Set up for processing the pdf
if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = (function() {
		return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback, element) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();
}

//Function for creating a canvas with one pdf page on it
function handlePages(page) {
	var viewport = page.getViewport(pdfScale);

	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	canvas.height = viewport.height;
	canvas.width = viewport.width;

	var renderContext = {
		canvasContext: context,
		viewport: viewport
	};
	
	//Draw the pdf on the canvas
	page.render(renderContext);
	
	//Add the canvas to the web page
	document.getElementById('pdf_div').appendChild(canvas);
	
	//Move to next page while there are more pages to display
	currPage++;
	if (thePDF != null && currPage <= numPages) {
		thePDF.getPage(currPage).then(handlePages);
	}
}
/** End PDF stuff **/

/** Start time remaining stuff **/
//Get the time remaining in human readable format
function getTimeRemaining(endtime) {
	var t = Date.parse(endtime) - Date.parse(new Date());
	if (t <= 0) {
		return {
			'total': 0,
			'days': 0,
			'hours': 0,
			'minutes': 0,
			'seconds': 0
		};
	}
	var seconds = Math.floor( (t/1000) % 60 );
	var minutes = Math.floor( (t/1000/60) % 60 );
	var hours = Math.floor( (t/(1000*60*60)) % 24 );
	var days = Math.floor( t/(1000*60*60*24) );
	return {
		'total': t,
		'days': days,
		'hours': hours,
		'minutes': minutes,
		'seconds': seconds
	};
}

//Set the time interval and time remaining for displaying
function initializeClock(id, endtime) {
	var clock = document.getElementById(id);
	var timeinterval = setInterval(function() {
		var t = getTimeRemaining(endtime);
		var remaining = '';
		if (t.days > 0) remaining += t.days + 'd ';
		if (t.hours > 0) remaining += t.hours + 'h ';
		remaining += t.minutes + 'm ' + t.seconds + 's ';
		if (t.total <= 0) {
			window.location.href = testURL;
			// remaining = 'Ended';
			// $('#time_button').addClass('btn-danger').removeClass('btn-warning');
		}
		clock.innerHTML = remaining;
		// if(t.total <= 0) {
			// clearInterval(timeinterval);
		// }
	},1000);
}
/** End time remaining stuff **/

$(function() {
	//File selection input
	$('#file_name').click(function() {
		$('#select_file').click();
	});
	
	//When a file is chosen or canceled
	$('#select_file').change(function(e) {
		//Make sure the file isn't too large for the fs library to handle
		var files = e.target.files;
		if (files.length > 0 && files[0].size/1024/1024 > 100) {
			alert('Files must be smaller than 100MB');
			$('#select_file').val('');
		}
		//Show selected file name
		var filename = $('#select_file').val().split('\\').pop().split('/').pop();
		$('#file_name').val(filename);
	});
	
	//Validate on submission
	$('#test_form').submit(function(e) {
		if (!validateForm()) {
			e.preventDefault();
		}
	});
	
	//Start the timer until end time
	initializeClock('time_remaining', end_time);
});