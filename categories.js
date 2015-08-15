jQuery("body").delegate("input.catHider","click",function(){
	var v = jQuery(this).val();
	var c = jQuery(this).prop("checked");
	alert(v+" checked:"+c);
});
jQuery("a.a-declarative").mouseover(function() {
	jQuery("ul.gbw_pop_ul").children().each(function() {
		if (jQuery(this).html()==undefined || jQuery(this).hasClass("has_divider") || jQuery(this).find("a").attr("value") == "all") return;
		jQuery(this).children("a").css("width","135px");
		if (jQuery(this).html().indexOf("catHider")==-1) jQuery(this).prepend("<span style='float:right;'><input value='"+jQuery(this).find("a").attr("value")+"' type='checkbox' class='catHider' /></span>");		
	});

});