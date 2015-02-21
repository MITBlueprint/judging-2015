$.delete = function(url, data, callback, type){
  if ( $.isFunction(data) ){
    type = type || callback,
    callback = data,
    data = {}
  }
  return $.ajax({
    url: url,
    type: 'DELETE',
    success: callback,
    data: data,
    contentType: type
  });
}

$(document).ready(function() {
	$("#delete-user-button").click(function() {
		var userid = $(this).attr('data');
		$.delete("/users/" + userid,
	  {},
	  function(data, status){
	    $("#user-"+userid).remove();
	  });
	});
});
