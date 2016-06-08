$(document).ready(function(){
	$('#starttime').datetimepicker({
		inline: true,
		sideBySide: true
	});
	
	$('#endtime').datetimepicker({
		inline: true,
		sideBySide: true
	});
	
	$('#starttime').on('dp.change', function (e) {
		$('#endtime').data('DateTimePicker').minDate(e.date);
	});
	
	$('#endtime').on('dp.change', function (e) {
		$('#starttime').data('DateTimePicker').maxDate(e.date);
	});
});