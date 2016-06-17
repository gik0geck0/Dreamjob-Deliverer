//Make sure there is either a name or email
function validateForm() {
    var name = $('#candidatename').val();
    var email = $('#candidateemail').val();
    if ((name == null || name == '') && (email == null || email == '')) {
        alert('A name or email must be provided');
        return false;
    }
	return true;
}

$(function() {
	//Make the start time datetimepicker
	$('#starttime').datetimepicker({
		inline: true,
		sideBySide: true,
		useCurrent: false,
		defaultDate: init_start,
		stepping: 1
	});
	
	//Make the end time datetimepicker
	$('#endtime').datetimepicker({
		inline: true,
		sideBySide: true,
		useCurrent: false,
		defaultDate: init_end,
		stepping: 1
	});
	
	//Link the pickers so that start <= end
	$('#starttime').data('DateTimePicker').maxDate(init_end);
	$('#endtime').data('DateTimePicker').minDate(init_start);
	
	//Relink if one changes
	$('#starttime').on('dp.change', function (e) {
		$('#endtime').data('DateTimePicker').minDate(e.date);
		$('#starttimehidden').val(new Date(e.date).toUTCString());
	});
	$('#endtime').on('dp.change', function (e) {
		$('#starttime').data('DateTimePicker').maxDate(e.date);
		$('#endtimehidden').val(new Date(e.date).toUTCString());
	});
	
	//Set the values of the hidden inputs
	$('#starttimehidden').val(init_start.toUTCString());
	$('#endtimehidden').val(init_end.toUTCString());
	
	//Validate on submission
	$('#test_form').submit(function(e) {
		if (!validateForm()) {
			e.preventDefault();
		}
	});
	
	//Submit the form on enter keypress
	$('#candidatename').keypress(function (e) {
		if (e.which == 13) {
			$('#test_form').submit();
			return false;
		}
	});
	$('#candidateemail').keypress(function (e) {
		if (e.which == 13) {
			$('#test_form').submit();
			return false;
		}
	});
});