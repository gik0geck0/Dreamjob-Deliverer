$(document).ready(function(){
	$('#file_name').click(function(){
		$('#select_file').click();
	});
	
	$('#select_file').change(function(){
		var filename = $('#select_file').val().split('\\').pop().split('/').pop() || "Select a file to upload";
		$('#file_name').val(filename);
	});
	
	initializeClock('time_remaining', '5/26/2216 0:12:00 UTC');
});

function getTimeRemaining(endtime){
	var t = Date.parse(endtime) - Date.parse(new Date());
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

function initializeClock(id, endtime){
	var clock = document.getElementById(id);
	var timeinterval = setInterval(function(){
		var t = getTimeRemaining(endtime);
		var remaining = "";
		if (t.days > 0) remaining += t.days + 'd ';
		if (t.hours > 0) remaining += t.hours + 'h ';
		remaining += t.minutes + 'm ' + t.seconds + 's ';
		if (t.total <= 0) {
			remaining = "Ended";
			$('#time_button').addClass('btn-danger').removeClass('btn-warning');
		}
		clock.innerHTML = remaining;
		if(t.total<=0){
			clearInterval(timeinterval);
		}
	},1000);
}

//Let's try pdf stuff
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

PDFJS.disableStream = true;


//TODO: we have to get the path via GET or POST or something?
PDFJS.getDocument('../pdfFiles/temp.pdf').then(function(pdfFile) {
    
    var pageNumber = 1;
    pdfFile.getPage(pageNumber).then(function(page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);

        var canvas = document.getElementById('pdf_canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext);
    });
});









