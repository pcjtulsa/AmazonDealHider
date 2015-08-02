// Copyright (c) 2015 Patrick Johnston. All rights reserved.

var hideThis = chrome.contextMenus.create({"title": "Show/Hide this deal", "contexts": ["link"], "onclick":showHideDeal, "documentUrlPatterns": ["*://*.amazon.com/*"]});

function showHideDeal(info,tab) {
	var ASINpatt = /.*?\.?ama?zo?n\.(?:com|ca|co\.uk|co\.jp|de|fr)\/(?:exec\/obidos\/ASIN\/|o\/|gp\/product\/|(?:(?:[^"\'\/]*)\/)?dp\/|)(B[A-Z0-9]{9})(?:(?:\/|\?|\#)(?:[^"\'\s]*))?/
	var ASIN = info.linkUrl.replace(ASINpatt,"$1");
	if (!ASIN || ASIN.indexOf("http") != -1) {
		var dealIDpatt = /.*?\.?ama?zo?n\.(?:com|ca|co\.uk|co\.jp|de|fr)\/(?:s|b)(?:\/browse|)\/ref=.*?([0-9a-f]{8})\?.*/
		ASIN = info.linkUrl.replace(dealIDpatt,"$1");
		if (!ASIN || ASIN.indexOf("http") != -1) {
			console.log("Error: ASIN not found.");
			return;
		}
		console.log("Using deal ID.");
	}
	chrome.storage.sync.get("blockASINs",function (items) {
		if (items.blockASINs == undefined) items.blockASINs = [];
		var ASINlist = items.blockASINs;
		if (ASINlist.indexOf(ASIN) != -1) {
			console.log("Show ASIN "+ASIN);
			ASINlist.splice(ASINlist.indexOf(ASIN),1);
		}
		else {
			console.log("Hide ASIN "+ASIN);
			ASINlist.push(ASIN);
		}
		chrome.storage.sync.set({"blockASINs":ASINlist},function() {
			chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id,{command:"RefreshDeals"});
			});
		});
	});
}

//var showAll = chrome.contextMenus.create({"title": "Show all hidden deals", "contexts": ["page","link","image"], "type": "checkbox", "onclick":showAllClicked, "documentUrlPatterns": ["*://*.amazon.com/*"]});

function showAllClicked(info, tab) {
	chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id,{command:"ShowAllDeals",value:info.checked});
	});
}

var clearList = chrome.contextMenus.create({"title": "Clear list of deals to hide", "contexts": ["page","link","image"], "onclick":clearASINs, "documentUrlPatterns": ["*://*.amazon.com/*"]});

function clearASINs(info,tab) {
	if (!confirm("Are you sure you want to clear the list?")) return;
	chrome.storage.sync.set({"blockASINs":[]},function() {
		console.log("Clearing list");
		chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id,{command:"RefreshDeals"});
		});
	});
}

chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
	chrome.storage.sync.get("blockASINs",function (items) {
		sendResponse({list: items.blockASINs});
	});	
	return true;
});