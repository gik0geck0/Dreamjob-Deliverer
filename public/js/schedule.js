var today = new Date();
today.setUTCSeconds(0);

function validateForm() {
    var name = $('#candidatename').val();
    var email = $('#candidateemail').val();
	var start = $('#starttimehidden').val();
	var end = $('#endtimehidden').val();
    if ((name == null || name == '') && (email == null || email == '')) {
        alert('A name or email must be provided');
        return false;
    }
}

$(document).ready(function(){
	$('#starttime').datetimepicker({
		inline: true,
		sideBySide: true,
		useCurrent: false,
		defaultDate: today,
		stepping: 1
	});
	
	$('#endtime').datetimepicker({
		inline: true,
		sideBySide: true,
		useCurrent: false,
		defaultDate: today,
		stepping: 1
	});
	
	$('#starttime').data('DateTimePicker').maxDate(today);
	$('#endtime').data('DateTimePicker').minDate(today);
	
	$('#starttime').on('dp.change', function (e) {
		$('#endtime').data('DateTimePicker').minDate(e.date);
		$('#starttimehidden').val(new Date(e.date).toUTCString());
	});
	
	$('#endtime').on('dp.change', function (e) {
		$('#starttime').data('DateTimePicker').maxDate(e.date);
		$('#endtimehidden').val(new Date(e.date).toUTCString());
	});
	
	$('#starttimehidden').val(today.toUTCString());
	$('#endtimehidden').val(today.toUTCString());
	
	$('#test_form').submit(validateForm);
});
