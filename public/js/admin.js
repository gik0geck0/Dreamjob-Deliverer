function loadTest(testtitle, testdescription) {
    $('#test-list').append(
		"<a id='view-" + testtitle + "' class='list-group-item'>\
			<button class='btn btn-info pull-right' id='schedule-" + testtitle + "'>schedule</button>\
			<h4>" + testtitle + "<br/>\
			<small>" + testdescription + "</small></h4>\
		</a>"
	);
}

function addScheduled(candidate, email, title, start, end) {
	$('#scheduled-tbody').append(
		"<tr>\
			<td>" + candidate + email + "</td>\
			<td>" + title + "</td>\
			<td>" + start + "</td>\
			<td>" + end + "</td>\
			<td class='glyph-td' title='Reschedule test times'>\
				<a href='#'>\
					<span class='glyph glyphicon glyphicon-calendar'></span>\
				</a>\
			</td>\
		</tr>"
	);
}

function addInProgress(candidate, email, title, start, end) {
	$('#in-progress-tbody').append(
		"<tr>\
			<td>" + candidate + email + "</td>\
			<td>" + title + "</td>\
			<td>" + start + "</td>\
			<td>" + end + "</td>\
			<td class='glyph-td' title='Reschedule test times'>\
				<a href='#'>\
					<span class='glyph glyphicon glyphicon-calendar'></span>\
				</a>\
			</td>\
		</tr>"
	);
}

function addFinished(candidate, email, title, start, end) {
	$('#finished-tbody').append(
		"<tr>\
			<td>" + candidate + email + "</td>\
			<td>" + title + "</td>\
			<td>" + start + "</td>\
			<td>" + end + "</td>\
			<td class='glyph-td' title='Reschedule test times'>\
				<a href='#'>\
					<span class='glyph glyphicon glyphicon-calendar'></span>\
				</a>\
			</td>\
			<td class='glyph-td' title='Download test submission'>\
				<a href='#'>\
					<span class='glyph glyphicon glyphicon-save'></span>\
				</a>\
			</td>\
		</tr>"
	);
}

function addInstance(candidate, email, title, start, end) {
	var today = new Date();
	start = new Date(start);
	var startformatted = start.toString().substring(4, 21);
	//(start.getMonth()+1) + '-' + start.getDate() + '-' + start.getFullYear() + ' ' + start.getHours() + ':' + start.getMinutes();
	end = new Date(end);
	var endformatted = end.toString().substring(4, 21);
	//(end.getMonth()+1) + '-' + end.getDate() + '-' + end.getFullYear() + ' ' + end.getHours() + ':' + end.getMinutes();
	
	//Format email
	if (email != null && email != '') {
		email = ' (' + email + ')';
	}
	
	//Add scheduled test
	if (start > today) {
		addScheduled(candidate, email, title, startformatted, endformatted);
	}
	
	//Add in-progress test
	if (start < today && end > today) {
		addInProgress(candidate, email, title, startformatted, endformatted);
	}
	
	//Add finished test
	if (end < today) {
		addFinished(candidate, email, title, startformatted, endformatted);
	}
}

$(function(){
	var gotoview = true;
	
	$('#test-list a > button').click(function() {
		gotoview = false;
		window.location.href = '/app/admin/schedule?testname=' + this.id.substring(9);
	});
	
	$('#test-list a').click(function() {
		if (gotoview)
			window.location.href =  '/app/admin/view?testname=' + this.id.substring(5);
	});
	
    $('#create-new-test').click(function(){
        window.location.href = '/app/admin/create';
    });
	
	$('#alert-fail').on('closed.bs.alert', function(){
		$(window).trigger('resize');
	});
	
	$('#alert-success').on('closed.bs.alert', function(){
		$(window).trigger('resize');
	});
	
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
	
	$('#tabs').tab();
	
	$(window).trigger('resize');
});

$(window).on('resize', function() {
	$('.scrolling-list').each(function(i, obj) {
		$(obj).css('max-height', ($(window).height()-$('#top-row').height()-150)/2);
	});
});