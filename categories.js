jQuery("body").delegate("input.catHider","click",function(){
	var v = jQuery(this).parent().next().attr("value");
	alert(v + " checked: "+jQuery(this).prop("checked"));	
});
jQuery("a.a-declarative").mouseover(function() {
	jQuery("ul.gbw_pop_ul").children().each(function() {
		jQuery(this).children("a").css("width","135px");
		if (jQuery(this).html()==undefined) return;
		if (jQuery(this).html().indexOf("catHider")==-1) jQuery(this).prepend("<span style='float:right;'><input type='checkbox' class='catHider' /></span>");
	});

});