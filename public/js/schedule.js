function validateForm() {
    var name = $('#candidatename').val();
    var email = $('#candidateemail').val();
    if ((name == null || name == '') && (email == null || email == '')) {
        alert('A name or an email must be provided');
        return false;
    }
}

$(document).ready(function(){
	$('#starttime').datetimepicker({
		inline: true,
		sideBySide: true,
		defaultDate: new Date()
	});
	
	$('#endtime').datetimepicker({
		inline: true,
		sideBySide: true,
		defaultDate: new Date()
	});
	
	$('#starttime').on('dp.change', function (e) {
		$('#endtime').data('DateTimePicker').minDate(e.date);
		$('#starttimehidden').val(e.date);
	});
	
	$('#endtime').on('dp.change', function (e) {
		$('#starttime').data('DateTimePicker').maxDate(e.date);
		$('#endtimehidden').val(e.date);
	});
	
	$('#starttimehidden').val(new Date());
	$('#endtimehidden').val(new Date());
	
	$('#test_form').submit(validateForm);
});
