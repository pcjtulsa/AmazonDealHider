// Copyright (c) 2015 Patrick Johnston. All rights reserved.
// Portions of this script incorporate and modify JavaScript from Amazon
var extensionId = "hhomjdbcpiomhhnbahbgbcejaoelmaha";
var didFirstLoad = false;
var showAllDeals = false;
var ASINlist = [];
var categoryList = [];
function checkDeal(tDeal) {
	if (showAllDeals || Deal == undefined) return false;
	for (var bucket in Deal.controller.metadata.dealIdBuckets) {
		for (var sb in Deal.controller.metadata.dealIdBuckets[bucket]) {
			for (var cat in categoryList) {
				if (Deal.controller.metadata.dealIdBuckets[bucket][sb][cat] == undefined) continue;
				if (Deal.controller.metadata.dealIdBuckets[bucket][sb][cat].indexOf(tDeal.dealID) != -1) return true;
			}
		}
	}
	if (ASINlist==undefined || tDeal==undefined) return false;
	if (ASINlist.indexOf(tDeal.buyAsin) != -1 || ASINlist.indexOf(tDeal.impressionAsin) != -1 || ASINlist.indexOf(tDeal.parentAsin) != -1 || ASINlist.indexOf(tDeal.teaser.teaserAsin) != -1 || ASINlist.indexOf(tDeal.dealID) != -1) return true;
	if (tDeal.detail == undefined) return false;
	if (tDeal.detail.URL == null) return false;
	var ASINpatt = /.*?\.?ama?zo?n\.(?:com|ca|co\.uk|co\.jp|de|fr)\/(?:exec\/obidos\/ASIN\/|o\/|gp\/product\/|(?:(?:[^"\'\/]*)\/)?dp\/|)(B[A-Z0-9]{9})(?:(?:\/|\?|\#)(?:[^"\'\s]*))?/
	var ASIN = tDeal.detail.URL.replace(ASINpatt,"$1");
	return (ASINlist.indexOf(ASIN) != -1);
}

function ManageCategory(cat, ar) {
	chrome.runtime.sendMessage(extensionId, {message: "categories", category: cat, addremove: ar}, function(response) {
		RefreshDeals();
	});
}

document.addEventListener("load",function() {
	chrome.runtime.sendMessage(extensionId, {message: "items"},
		function(response) {
			if (!response.list || response.list == "") {
				console.log("Empty list.");
				return;
			}
			ASINlist = response.list;
			Deal.controller.metadata.getDealIds = function(g, a, d, b, h) {
				var i = this;
				var e = [];
				if (g === null || g === undefined) {
					return e
				}
				if (a === null || a === undefined) {
					return e
				}
				if (d === null || d === undefined) {
					return e
				}
				if (i.dealIdBuckets[g] === null || i.dealIdBuckets[g] === undefined) {
					return e
				}
				if (i.dealIdBuckets[g][a] === null || i.dealIdBuckets[g][a] === undefined) {
					return e
				}
				if (i.dealIdBuckets[g][a][d] === null || i.dealIdBuckets[g][a][d] === undefined) {
					return e
				}
				if ((b === null || b === undefined) && (h === null || h === undefined)) {
					e = i.dealIdBuckets[g][a][d];
					if (!showAllDeals) {
						for (var x in e) { 
							if (Deal.controller.deals[e[x]] == undefined) continue;
							if (checkDeal(Deal.controller.deals[e[x]])) e.splice(x,1);
						}
					}
					return e
				}
				if (b && h) {
					e = i.dealIdBuckets[g][a][d];
					if (!showAllDeals) {
						for (var x in e) { 
							if (Deal.controller.deals[e[x]] == undefined) continue;
							if (checkDeal(Deal.controller.deals[e[x]])) e.splice(x,1);
						}
					}
					var c = (b - 1) * h;
					var f = c + h;
					return e.slice(c, f)
				}
				return e 
			}
			Deal.controller.prevPage = function(b, a) {
				if (this.page[b] === 1) {
					if (a) {
						this.setPage(b, this.pages[b])
					} else {
						Deal.log("Error: Already at first page.");
						return
					}
				} else {
					this.setPage(b, this.page[b] - 1)
				}
				if (Deal.controller.retainFilters[b]) {
					Deal.setURLFilters(b)
				}
				RefreshDeals();
			}
			Deal.controller.nextPage = function(b, a) {
				if (this.page[b] < this.pages[b]) {
					this.setPage(b, this.page[b] + 1)
				} else {
					if (a) {
						this.setPage(b, 1)
					} else {
						Deal.log("Error: Already at last page");
						return
					}
				}
				if (Deal.controller.retainFilters[b]) {
					Deal.setURLFilters(b)
				}
				RefreshDeals();
			}
			if (!didFirstLoad) {
				jQuery("body").delegate("input.catHider","click",function(){
					ManageCategory(jQuery(this).val(),!jQuery(this).prop("checked"));
				});
				chrome.runtime.sendMessage(extensionId, {message: "categories"},
					function(categoryResponse) {
						jQuery("a.a-declarative").mouseover(function() {
							jQuery("li.gbw_pop_li").each(function() {
								var val = jQuery(this).find("a").attr("value");
								if (jQuery(this).html()==undefined || jQuery(this).hasClass("has_divider") || val == "all") return;
								jQuery(this).children("a").css("width","135px");
							    if (categoryResponse.list == undefined) return;
								var checked = (categoryResponse.list.indexOf(val) != -1)?" checked=''":"";
								if (jQuery(this).html().indexOf("catHider")==-1) jQuery(this).prepend("<span style='float:right;'><input value='"+val+"'"+checked+" type='checkbox' class='catHider' /></span>");		
							});
						});
					});
				setTimeout(RefreshDeals,500);
				didFirstLoad = true;
			}
		}
	);
},true);

function RefreshDeals() {
	console.log("Refreshing deals.");
	chrome.runtime.sendMessage(extensionId, {message:"all"},
		function(response) {
			ASINlist = response.itemList;
			categoryList = response.categoryList;
			for (var b in Deal.controller.metadata.dealIdBuckets) {
				Deal.controller.trigger ('metadata_change'+b);
				if (showAllDeals) continue;
				for (var d in Deal.controller.dealIDs[b]) {
					if (checkDeal(Deal.controller.deals[Deal.controller.dealIDs[b][d]])) {
						setTimeout(RefreshDeals,500);
						return;
					}
				}
			}
		});
}

document.addEventListener("RefreshDeals",RefreshDeals);

document.addEventListener("ShowAllDeals",function(event) {
	showAllDeals = event.detail;
	if (showAllDeals) console.log("Showing all deals");
	else console.log("Not showing all deals");
	RefreshDeals();
});