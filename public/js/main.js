/* Site wide js file */

//URL paths for links
var url_port = window.location.port == '80' || window.location.port == '8080' || window.location.port == '' ? '' : ':' + window.location.port;
var hostURL = window.location.protocol + '//' + window.location.hostname + url_port;
var testURL = '/test/';
var adminURL = '/admin/'
var createURL = '/admin/create/';
var scheduleURL = '/admin/schedule/';
var rescheduleURL = '/admin/reschedule/';
var viewURL = '/admin/view/';
var downloadURL = '/admin/download/';

$(function() {
	//Cancel buttons go back a page
	$('#cancel').click(function () {
		window.history.back();
		return false;
	});
});
