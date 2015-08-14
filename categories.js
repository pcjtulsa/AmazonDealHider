jQuery("body").delegate("input.catHider","click",function(){
	var v = jQuery(this).val();
	var c = jQuery(this).prop("checked");
	var $sp = jQuery(this).parent().parent().parent().parent().parent();
	if (v=="all") {
		$sp.find("input").prop("checked",c);
	}
	else {
		var $a = $sp.find('input[value="all"]');
		if (!c) $a.prop("checked",false);
		else {
			if ($sp.find("input").not('input[value="all"]').length == $sp.find("input:checked").not('input[value="all"]').length) $a.prop("checked",true);
			else $a.prop("checked",false);
		}
	}
	alert(v + " checked: "+c);	
});
jQuery("a.a-declarative").mouseover(function() {
	jQuery("ul.gbw_pop_ul").children().each(function() {
		jQuery(this).children("a").css("width","135px");
		if (jQuery(this).html()==undefined || jQuery(this).hasClass("has_divider")) return;
		if (jQuery(this).html().indexOf("catHider")==-1) jQuery(this).prepend("<span style='float:right;'><input value='"+jQuery(this).find("a").attr("value")+"' type='checkbox' class='catHider' /></span>");
	});

});