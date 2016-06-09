function loadList() {
    $('#test_list').append("<a href='#' class='list-group-item'><span class='badge'>schedule</span> Item</a>");
}

function addScheduled(candidate, title, start, end) {
	$('#scheduled-tbody').append(`<tr><td>${candidate}</td><td>${title}</td><td>${end}</td></tr>`);
}

function addInProgress(candidate, title, end) {
	$('#scheduled-tbody').append(`<tr><td>${candidate}</td><td>${title}</td><td>${end}</td></tr>`);
}

function addFinished(candidate, title, end) {
	$('#scheduled-tbody').append(`<tr><td>${candidate}</td><td>${title}</td><td>${end}</td></tr>`);
}

$(document).ready(function(){
	loadList();
	loadList();
	addInProgress('Tom', 'Test1', '07-05-2016');
    
    $('#create-new-test').click(function(){
        var url = '/create';
        window.location.href = url;
    });
	
	$('#tabs').tab();
	
	$(window).trigger('resize');
});

$(window).on('resize', function() {
	$('.scrolling-list').each(function(i, obj) {
		$(obj).css('max-height', $(window).height()/3);
	});
});