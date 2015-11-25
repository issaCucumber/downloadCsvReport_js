/**
 * Report Download (javascript)
 */

$(function() {
	
	var __filterType__ = "full";
	var __filterParam__ = [];
	
	//init button clicks and object
	$('.input-daterange').datepicker({
		orientation: "top left",
		format: "yyyy-mm-dd",
		startDate: "2015-09-04",
	    endDate: "today"
	});
	
	$("body").on("change", "input[name=optradio]", function(){
		
		var filterType = $(this).val();
		__filterType__ = filterType;
		
		if(filterType == "full"){
			$("input.date-picker").attr("disabled", "disabled");
		}else if(filterType == "date"){
			$("input.date-picker").removeAttr("disabled");
		}
		
	});
	
	$("body").on("click", "button.download", function(){
		
		$(".error").hide();
		__filterParam__ = [];
		
		if(__filterType__ == "date" && $("input#start-date").val() == ""){
			$(".error-message").text("Please specify date range.");
			$(".error").show();
			
			return false;
		}
		
		if(__filterType__ == "date"){
			__filterParam__.push($("input#start-date").val());
			__filterParam__.push($("input#end-date").val());
		}
		
		$("button.download").attr("disabled", "disabled");
		
		var filterObject = {};
		filterObject[__filterType__] = __filterParam__;
		
		var filterJson = JSON.stringify( filterObject );
		
		var params = {
				"filter" 	: filterJson,
				"vsr"		: $("input#vsr").val()
		};
		
		$("#download-link-div").hide();
		
		$.post("v.php", params, function(dataStr){
			
			$("button.download").removeAttr("disabled");
		
			var response = JSON.parse(dataStr);
			
			if(response.status == "SUCCESS"){
				downloadCSV(response.object);
			}else{
				$(".alert-danger").slideDown().delay(5000).slideUp();
			}
			
		});
		
	});
	
});

var COLUMNDELIMITER = COLUMNDELIMITER || ',';
var LINEDEMLIMITER 	= LINEDEMLIMITER || '\n';

function convertArrayOfObjectsToCSV(data) {

    if (data == null || !data.length) {
        return null;
    }
    
    result = '';
    $.each(data, function(i, row){
    	result += row.join(COLUMNDELIMITER);
    	result += LINEDEMLIMITER;
    });

    return result;
}

function downloadCSV(response) {

	var data;
	
    var csv = convertArrayOfObjectsToCSV(response.reportData);
    if (csv == null) return;

    var filename = response.reportName;
    
    var link = document.createElement('a');
    
    var ua 			= window.navigator.userAgent;
    
    var isChrome 		= ua.match(/Chrome/i);
    var isSafari 		= ua.match(/Safari/i);
    var isFirefox_IE	= ua.match(/Firefox/i) || ua.match(/MSIE/i) 
    
    if(typeof link.download != "undefined")
    {
    	if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        
        data = encodeURI(csv);
        
        //download attribute is supported
    	//create a temp link and trigger click function on it
        //this is not working on safari
        
        $("#user_report").attr("href", data);
        $("#user_report").attr("download", filename);
        document.getElementById("user_report").click();
    	
    }else{
    	if (!csv.match(/^data:attachment\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        
        data = encodeURI(csv);
        
    	// download attribute is not supported
    	// e.g. safari
    	// user has to download via a download link
    	 var $downloadDiv = $('#downloadLink');
    	 $downloadDiv.empty();
    	 
         $("<a></a>")
        	.attr('href', data)
        	.attr('download', filename)
        	.attr('target', '_blank')
        	.text("click and save the file as " + filename)
        	.appendTo($downloadDiv);
         
         $("#download-link-div").show();
    }

}
