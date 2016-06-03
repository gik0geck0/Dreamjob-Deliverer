var fileUploadText = 'Select an instructions file to upload';

$(document).ready(function(){
	// $('#file_name').click(function(){
		// $('#select_file').click();
	// });
	
	// $('#select_file').change(function(){
		// var filename = $('#select_file').val().split('\\').pop().split('/').pop() || fileUploadText;
		// $('#file_name').val(filename);
	// });

	// $('#file_name').keydown(function(e){
		// if (e.which != 13 && e.which != 9)
		// e.preventDefault();
	// });
	
	$('#datetimepicker1').datetimepicker();
	
	$('#endtime').datetimepicker();
});