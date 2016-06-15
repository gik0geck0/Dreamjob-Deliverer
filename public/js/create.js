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
	//Allow only enter/tab key presses
	//so they can't change file name
	//if they could the instructions file could be empty
	$('#file_name').keydown(function(e) {
		if (e.which != 13 && e.which != 9)
			e.preventDefault();
	});
});