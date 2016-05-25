$(document).ready(function(){
	$('#file_name').click(function(){
		$('#select_file').click();
	});
	
	$('#select_file').change(function(){
		var filename = $('#select_file').val().split('\\').pop().split('/').pop() || "Select a file to upload";
		$('#file_name').val(filename);
	});
	
	$('#time_button').click(function(){
		$('#time_remaining').html(new Date().getTime());
	});
});