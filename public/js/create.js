//Make sure there is a file selected
function validateForm() {
    var filename = $('#file_name').val();
    var file = $('#select_file').val();
    if ((filename == null || filename == '') && (file == null || file == '')) {
        alert('A file must be selected');
        return false;
    }
	return true;
}

$(function() {
	//File selection input
	$('#file_name').click(function() {
		$('#select_file').click();
	});
	
	//When a file is chosen or canceled
	$('#select_file').change(function(e) {
		//Make sure the file isn't too large for the fs library to handle
		var files = e.target.files;
		if (files.length > 0 && files[0].size/1024/1024 > 100) {
			alert('Files must be smaller than 100MB');
			$('#select_file').val('');
		}
		//Show selected file name
		var filename = $('#select_file').val().split('\\').pop().split('/').pop() || '';
		$('#file_name').val(filename);
	});
	
	//Validate on submission
	$('#test_form').submit(function(e) {
		if (!validateForm()) {
			e.preventDefault();
		}
	});
});