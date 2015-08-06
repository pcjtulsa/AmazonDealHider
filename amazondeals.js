// Copyright (c) 2015 Patrick Johnston. All rights reserved.
var urlPatterns = ["*://*.amazon.com/*","*://*.amazon.ca/*","*://*.amazon.co.uk/*","*://*.amazon.co.jp/*","*://*.amazon.de/*","*://*.amazon.fr/*"];
var hideThis = chrome.contextMenus.create({"title": "Show/Hide this deal", "contexts": ["link"], "onclick":showHideDeal, "documentUrlPatterns": urlPatterns});
function getCacheKey(key, i) {
	return (i === 0) ? key : key + "_" + i;
}

function showHideDeal(info,tab) {
	var ASINpatt = /.*?\.?ama?zo?n\.(?:com|ca|co\.uk|co\.jp|de|fr)\/(?:exec\/obidos\/ASIN\/|o\/|gp\/product\/|(?:(?:[^"\'\/]*)\/)?dp\/|)(B[A-Z0-9]{9})(?:(?:\/|\?|\#)(?:[^"\'\s]*))?/
	var ASIN = info.linkUrl.replace(ASINpatt,"$1");
	if (!ASIN || ASIN.indexOf("http") != -1) {
		var dealIDpatt = /.*?\.?ama?zo?n\.(?:com|ca|co\.uk|co\.jp|de|fr)(?:\/jewelry|)\/(?:s|b|gp\/search|gp\/browse.html|gp\/coupon.*?)(?:\/browse|)\/ref=.*?([0-9a-f]{8})\?.*/
		ASIN = info.linkUrl.replace(dealIDpatt,"$1");
		if (!ASIN || ASIN.indexOf("http") != -1) {
			console.log("Error: ASIN not found.");
			return;
		}
		console.log("Using deal ID.");
	}
	chrome.storage.sync.get(null,function (items) {
		var i = 0;
		var value = "";
		for(i=0; i<chrome.storage.sync.MAX_ITEMS; i++) {
			if(items[getCacheKey("blockASINs", i)] === undefined) break;
			value += items[getCacheKey("blockASINs", i)];
		}
		var ASINlistP = (value=="")?"[]":value;
		var ASINlist = JSON.parse(ASINlistP);
		if (ASINlist.indexOf(ASIN) != -1) {
			console.log("Show "+ASIN);
			ASINlist.splice(ASINlist.indexOf(ASIN),1);
		}
		else {
			console.log("Hide "+ASIN);
			ASINlist.push(ASIN);
		}
		i = 0;
		var cache = {};
		var segment;
		var cacheKey;
		value = JSON.stringify(ASINlist);
		while(value.length > 0) {
			cacheKey = getCacheKey("blockASINs", i);
			segment = value.substr(0, chrome.storage.sync.QUOTA_BYTES_PER_ITEM - cacheKey.length - 2);
			segment = segment.substr(0, segment.length - ((segment.match(/"/g) || []).length));
			cache[cacheKey] = segment;
			value = value.substr(segment.length);
			i++;
		}
		chrome.storage.sync.set(cache,function() {
			chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id,{command:"RefreshDeals"});
			});
		});
		chrome.storage.sync.remove(getCacheKey("blockASINs", i));
	});
}
var sep = chrome.contextMenus.create({"type":"separator","contexts":["link"],"documentUrlPatterns":urlPatterns});
var showAll = chrome.contextMenus.create({"title": "Show all hidden deals", "contexts": ["page","link","image"], "type": "checkbox", "onclick":showAllClicked, "documentUrlPatterns": urlPatterns});

function showAllClicked(info, tab) {
	chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id,{command:"ShowAllDeals",value:info.checked});
	});
}

var clearList = chrome.contextMenus.create({"title": "Clear list of deals to hide", "contexts": ["page","link","image"], "onclick":clearASINs, "documentUrlPatterns": urlPatterns});

function clearASINs(info,tab) {
	if (!confirm("Are you sure you want to clear the list?")) return;
	chrome.storage.sync.clear(function() {
		console.log("Clearing list");
		chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id,{command:"RefreshDeals"});
		});
	});
}

chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
	chrome.storage.sync.get(null,function (items) {
		var i = 0;
		var value = "";
		for(i=0; i<chrome.storage.sync.MAX_ITEMS; i++) {
			if(typeof(items[getCacheKey("blockASINs",i)]) == "undefined") break;
			value += items[getCacheKey("blockASINs",i)];
		}
		var ASINlist = (value=="")?"[]":value;
		sendResponse({list: JSON.parse(ASINlist)});
	});	
	return true;
});
