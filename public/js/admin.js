//Create a row for a test in the upper box
function loadTest(testtitle, testdescription) {
    $('#test-list').append(
		"<a id='view-" + testtitle + "' class='list-group-item'>\
			<button class='btn pull-right' id='schedule-" + testtitle + "'>schedule</button>\
			<h4>" + testtitle + "<br/>\
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
		"<tr>\
			<td><p>" + candidate + email + "</p></td>\
			<td>" + title + "</td>\
			<td>" + startformatted + "</td>\
			<td>" + endformatted + "</td>\
			<td class='glyph-td' title='Test URL'>\
				<a href='#' data-toggle='popover' data-placement='auto right' title='Click to copy URL' data-content='" + hostURL + testURL + uri + "'>\
					<span class='glyph glyphicon glyphicon-link'></span>\
				</a>\
			</td>\
			<td class='glyph-td' title='Reschedule test times'>\
				<a href='" + rescheduleURL + uri + "'>\
					<span class='glyph glyphicon glyphicon-calendar'></span>\
				</a>\
			</td>";
			
	var downloadHTML = 
		"<td class='glyph-td' title='Download test submission'>\
			<a href='#'>\
				<span class='glyph glyphicon glyphicon-save'></span>\
			</a>\
		</td>";
		
	var endHTML = "</tr>";
	
	//Add scheduled test
	if (start > today) {
		$('#scheduled-tbody').append(baseHTML + endHTML);
	}
	
	//Add in-progress test
	if (start < today && end > today) {
		$('#in-progress-tbody').append(baseHTML + endHTML);
	}
	
	//Add finished test
	if (end < today) {
		$('#finished-tbody').append(baseHTML + downloadHTML + endHTML);
	}
}

$(function(){
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
    $('#create-new-test').click(function(){
        window.location.href = createURL;
    });
	
	//Close fail alert
	$('#alert-fail').on('closed.bs.alert', function(){
		$(window).trigger('resize');
	});
	
	//Close success alert
	$('#alert-success').on('closed.bs.alert', function(){
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
	
	//Set up schedule/in-progress/finished tabs
	$('#tabs').tab();
	
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
	
	//Trigger a resize for formatting
	$(window).trigger('resize');
});

//Format test tables so that they stay on one page
$(window).on('resize', function() {
	$('.scrolling-list').each(function(i, obj) {
		$(obj).css('max-height', ($(window).height()-$('#top-row').height()-75)/2);
	});
});