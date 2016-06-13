/* Site wide js file */

//URL paths for links
var url_port = window.location.port == '80' || window.location.port == '8080' ? '' : ':' + window.location.port;
var hostURL = window.location.protocol + '//' + window.location.hostname + url_port;
var testURL = '/app/test/';
var adminURL = '/app/admin/'
var createURL = '/app/admin/create/';
var scheduleURL = '/app/admin/schedule/';
var rescheduleURL = '/app/admin/reschedule/';
var viewURL = '/app/admin/view/';

$(function() {
	//Cancel buttons go back a page
	$('#cancel').click(function () {
		window.history.back();
		return false;
	});
});