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
	$('#test_form').submit(validateForm);
});

function validateForm() {
    var name = $("#candidatename").val();
    var email = $("#candidateemail").val();
    if ((name == null || name == "") && (email == null || email == "")) {
        alert("A name or an email must be provided");
        return false;
    }
}