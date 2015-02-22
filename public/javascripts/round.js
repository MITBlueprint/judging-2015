$(document).ready(function() {
	$("#active-button").click(function() {
		if ($(this).hasClass("make-inactive-btn")) {
			$.post("/" + $(this).attr('data'),
		  {
	      state: "inactive"
		  },
		  function(data, status){
		    $("#active-status").html("INACTIVE");
		    $("#active-button").html("Make active");
		    $("#active-button").removeClass("make-inactive-btn");
		    $("#active-button").addClass("make-active-btn");
		  });
		} else if ($(this).hasClass("make-active-btn")) {
		  $.post("/" + $(this).attr('data'),
		  {
	      state: "active"
		  },
		  function(data, status){
		    $("#active-status").html("ACTIVE");
		    $("#active-button").html("Make inactive");
		    $("#active-button").removeClass("make-active-btn");
		    $("#active-button").addClass("make-inactive-btn");
		  });
		}
	});
	$("#advance-round-button").click(function() {
		var nCount = parseInt($("#round-count").text())+1;
		$.post("/" + $(this).attr('data'),
		{
		  state: "increment",
		  count: nCount
		},
		function(data, status){
			if (nCount == parseInt($("#total-round-count").text())) {
				$("#advance-round-button").remove();
			}
			$("#round-count").html(nCount.toString());
		});
	});
});
