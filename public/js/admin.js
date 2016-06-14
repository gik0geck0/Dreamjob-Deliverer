//Create a row for a test in the upper box
function loadTest(testtitle, testdescription) {
    $('#test-list').append(
		"<a id='view-" + testtitle + "' class='list-group-item'>\
			<button class='btn pull-right' id='schedule-" + testtitle + "'>schedule</button>\
			<h4 class='word-break'>" + testtitle + "<br/>\
			<small>" + testdescription + "</small></h4>\
		</a>"
	);
}

//Create a row for a test in the lower box
function addInstance(candidate, email, title, start, end, uri) {
	//Date now
	var today = new Date();
	
	//Format start
	start = new Date(start);
	var startformatted = start.toString().substring(4, 21);
	
	//Format end
	end = new Date(end);
	var endformatted = end.toString().substring(4, 21);
	
	//Format email
	if (email != null && email != '') {
		email = ' (' + email + ')';
	}
	
	//HTML for tests in tabs
	var baseHTML = 
		"<li class='list-group-item'>\
			<div class='row'>\
				<div class='col-sm-4 one-line-scroll'>" + candidate + email + "</div>\
				<div class='col-sm-2 one-line-scroll'>" + title + "</div>\
				<div class='col-sm-2 one-line'>" + startformatted + "</div>\
				<div class='col-sm-2 one-line'>" + endformatted + "</div>\
				<div class='col-sm-1 glyph-cell' title='Test URL'>\
					<a href='#' data-toggle='popover' data-placement='auto right' title='Click to copy URL' data-content='" + hostURL + testURL + uri + "'>\
						<span class='glyph glyphicon glyphicon-link'></span>\
					</a>\
				</div>";
			
	var rescheduleHTML = 
		"<div class='col-sm-1 glyph-cell' title='Reschedule test times'>\
			<a href='" + rescheduleURL + uri + "'>\
				<span class='glyph glyphicon glyphicon-calendar'></span>\
			</a>\
		</div>";
			
	var downloadHTML = 
		"<div class='col-sm-1 glyph-cell' title='Download test submission'>\
			<a href='" + downloadURL + uri + "'>\
				<span class='glyph glyphicon glyphicon-save'></span>\
			</a>\
		</div>";
		
	var endHTML = "</div></li>";
	
	//Add scheduled test
	if (start > today) {
		$('#scheduled-tests').append(baseHTML + rescheduleHTML + endHTML);
	}
	
	//Add in-progress test
	if (start < today && end > today) {
		$('#in-progress-tests').append(baseHTML + rescheduleHTML + endHTML);
	}
	
	//Add finished test
	if (end < today) {
		$('#finished-tests').append(baseHTML + downloadHTML + endHTML);
	}
}

//Close all open popovers
function closePopovers() {
	//Clcik all the popovers that are open
	$('[data-original-title]').each(function () {
		if ($(this).next().hasClass('popover')) {
			//$(this).popover('hide'); has a bug that makes the popover 
			//stay hidden until it is clicked again twice instead of once
			$(this).click();
		}
	});
}

$(function() {
	/** Button and a redirects **/
	//Redirect to /view or /schedule for the test clicked
	var gotoview = true;
	$('#test-list a > button').click(function() {
		gotoview = false;
		window.location.href = scheduleURL + '?testname=' + encodeURIComponent(this.id.substring(9));
	});
	$('#test-list a').click(function() {
		if (gotoview)
			window.open(viewURL + '?testname=' + encodeURIComponent(this.id.substring(5)), '_blank');
	});
	
	//Redirect to /create
    $('#create-new-test').click(function() {
        window.location.href = createURL;
    });
	
	/** Alert success/fail stuff **/
	//Close fail alert
	$('#alert-fail').on('closed.bs.alert', function() {
		$(window).trigger('resize');
	});
	
	//Close success alert
	$('#alert-success').on('closed.bs.alert', function() {
		$(window).trigger('resize');
	});
	
	//Copy url from success alert
	$('#alert-success').click(function() {
		var span = document.getElementById('url-text');
		var range = document.createRange();
		range.setStartBefore(span.firstChild);
		range.setEndAfter(span.lastChild);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
			console.log('URL copy was ' + msg);
		} catch (err) {
			console.error('Unable to copy URL');
		}
	});
	
	/** Test instance stuff **/
	//Set up schedule/in-progress/finished tabs
	$('#tabs').tab();
	
	/** Popover stuff **/
	//Give a popover to hyperlink icon in scheduled/in-progress/finished tabs
	$('[data-toggle="popover"]').popover().prop('title', 'Test URL');
	
	//Copy url from popover
	$(document).on('click', '.popover', function() {
		$(this).find('.popover-content').attr('id', $(this).attr('id') + '-content');
		var span = document.getElementById($(this).attr('id') + '-content');
		var range = document.createRange();
		range.setStartBefore(span.firstChild);
		range.setEndAfter(span.lastChild);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
			console.log('URL copy was ' + msg);
		} catch (err) {
			console.error('Unable to copy URL');
		}
	});
	
	//Close popovers when clicked away from them
	$(document).on('click', function(e) {
		//Check parents and self for .popover and [data-original-title]
		if ($(e.target).closest('.popover').length == 0 && $(e.target).closest('[data-original-title]').length == 0) {
			closePopovers();
		}
	});
	
	//Trigger a resize for formatting
	$(window).trigger('resize');
});

//Format test tables so that they stay on one page
$(window).on('resize', function() {
	$('.scrolling-list').each(function(i, obj) {
		$(obj).css('max-height', ($(window).height()-$('#top-row').height()-75)/2);
	});
});