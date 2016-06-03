function loadList() {
    var test_list = document.getElementById('test_list');
    var data = "<a href='#' class='list-group-item'><span class='badge'>schedule</span> Item</a>";
    test_list.innerHTML += data;
}

$(document).ready(function(){
    loadList(); loadList();
    
    $('#create-new-test').click(function(){
        var url = '/create';
        window.location.href = url;
    });


});