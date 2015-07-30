// Copyright (c) 2015 Patrick Johnston. All rights reserved.
var extensionId = "hhomjdbcpiomhhnbahbgbcejaoelmaha";
var js = document.createElement("script")
var t = document.createAttribute("src");
t.value = "chrome-extension://"+extensionId+"/dealcheck.js"
js.setAttributeNode(t);	
document.body.appendChild(js);

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	if (request.command == "RefreshDeals") {
		document.dispatchEvent(new CustomEvent("RefreshDeals", {detail:""}));
	}
	else if (request.command == "ShowAllDeals") {
		document.dispatchEvent(new CustomEvent("ShowAllDeals", {detail:request.value}));
	}
});