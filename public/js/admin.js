function loadList(testname) {
    $('#test_list').append(
		`<a href='/view?testname=${testname}' class='list-group-item'>
			<span class='badge' href='/schedule?testname=${testname}'>schedule</span>
			${testname}
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

$(document).ready(function(){
	loadList('Test1');
	loadList('Test2');
	loadList('Test1');
	loadList('Test2');
	loadList('Test1');
	loadList('Test2');
	loadList('Test1');
	loadList('Test2');
	loadList('Test1');
	loadList('Test2');
	loadList('Test1');
	loadList('Test2');
	loadList('Test1');
	loadList('Test2');
	loadList('Test1');
	loadList('Test2');
	loadList('Test1');
	loadList('Test2');
	loadList('Test1');
	loadList('Test2');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
	addScheduled('Tom', 'tom@gmail.com', 'Test1', '07-05-2016 7:00 am', '07-15-2016 7:00 am');
	addInProgress('Tom', 'tom@gmail.com', 'Test2', '06-05-2016 7:00 am', '07-05-2016 7:00 am');
	addFinished('Tom', 'tom@gmail.com', 'Test1', '06-05-2016 7:00 am', '06-08-2016 9:00 am');
    
    $('#create-new-test').click(function(){
        var url = '/create';
        window.location.href = url;
    });
	
	$('#tabs').tab();
	
	$(window).trigger('resize');
});

$(window).on('resize', function() {
	$('.scrolling-list').each(function(i, obj) {
		$(obj).css('max-height', ($(window).height()-$('#page-title').height()-$('#test-library-div').height()-150)/2);
	});
});