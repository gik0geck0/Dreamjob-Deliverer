function loadTest(testtitle, testdescription) {
    $('#test-list').append(
		`<a id='view-${testtitle}' class='list-group-item'>
			<button class='badge' id='schedule-${testtitle}'>schedule</button>
			${testtitle} ${testdescription}
		</a>`
	);
}

function addScheduled(candidate, email, title, start, end) {
	$('#scheduled-tbody').append(
		`<tr>
			<td>${candidate} (${email})</td>
			<td>${title}</td>
			<td>${start}</td>
			<td>${end}</td>
			<td class='glyph-td' title='Reschedule test times'>
				<a href='#'>
					<span class='glyph glyphicon glyphicon-calendar'></span>
				</a>
			</td>
		</tr>`
	);
}

function addInProgress(candidate, email, title, start, end) {
	$('#in-progress-tbody').append(
		`<tr>
			<td>${candidate} (${email})</td>
			<td>${title}</td>
			<td>${start}</td>
			<td>${end}</td>
			<td class='glyph-td' title='Reschedule test times'>
				<a href='#'>
					<span class='glyph glyphicon glyphicon-calendar'></span>
				</a>
			</td>
		</tr>`
	);
}

function addFinished(candidate, email, title, start, end) {
	$('#finished-tbody').append(
		`<tr>
			<td>${candidate} (${email})</td>
			<td>${title}</td>
			<td>${start}</td>
			<td>${end}</td>
			<td class='glyph-td' title='Reschedule test times'>
				<a href='#'>
					<span class='glyph glyphicon glyphicon-calendar'></span>
				</a>
			</td>
			<td class='glyph-td' title='Download test submission'>
				<a href='#'>
					<span class='glyph glyphicon glyphicon-save'></span>
				</a>
			</td>
		</tr>
	`);
}

function addInstance(candidate, email, title, start, end) {

}

$(document).ready(function(){
	loadTestList();
    addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	
	var gotoview = true;
	
	$('#test-list a button').click(function() {
		gotoview = false;
		window.location.href = '/schedule?testname=' + this.id.substring(9);
	});
	
	$('#test-list a').click(function() {
		if (gotoview)
			window.location.href =  '/view?testname=' + this.id.substring(5);
	});
	
    $('#create-new-test').click(function(){
        window.location.href = '/create';
    });
	
	$('#tabs').tab();
	
	$(window).trigger('resize');
});

$(window).on('resize', function() {
	$('.scrolling-list').each(function(i, obj) {
		$(obj).css('max-height', ($(window).height()-$('#page-title').height()-$('#test-library-div').height()-150)/2);
	});
});