{
	"translatorID": "5aabfa6e-79e6-4791-a9d2-46c9cb137561",
	"label": "Stanford Encyclopedia of Philosophy",
	"creator": "Sebastian Karcher",
	"target": "^https?://plato\\.stanford\\.edu/entries",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-04-22 00:05:53"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2011 Sebastian Karcher and the Center for History and New Media
					 George Mason University, Fairfax, Virginia, USA
					 http://zotero.org
	
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.match(/\/search\//)) return "multiple";
	if (url.match(/\entries\//)) return "bookSection";
}
	

function doWeb(doc, url){

	var articles = new Array();
	if(detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = doc.evaluate('//a[@class="l"]', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);	
		});
	} else {
		scrape(doc, url);
	}
}

// help function
function scrape(doc, url){
	//get abstract and tags from article plage
	//the xpaths aren't great , but seem reliable across pages
	var abs = ZU.xpathText(doc,'//p[1]').replace(/\n/g, "")
	var tags = ZU.xpathText(doc, '//p[last()]').replace(/\n/g, "").split(/\|/);
	for (i in tags){
		tags[i] = ZU.trimInternal(tags[i])
			}
	//get BibTex Link
	var bibtexurl = url.replace(/entries\//,"cgi-bin/encyclopedia/archinfo.cgi?entry=").replace(/\/$/, "");
	Zotero.Utilities.HTTP.doGet(bibtexurl, function (text) {
	
	//remove line breaks, then match match the bibtex, then remove the odd /t in it.
	bibtex = text.replace(/\n/g, "").match(/<pre>.+<\/pre>/)[0].replace(/\/t/g, "")
	//Zotero.debug(bibtex)

		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex);
		translator.setHandler("itemDone", function(obj, item) {
			if (abs) item.abstractNote = abs;
			if (tags) item.tags = tags;
			item.attachments = [{url:item.url, title: "SEP - Snapshot", mimeType: "text/html"}];
			item.complete();
		});	
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://plato.stanford.edu/search/searcher.py?query=epistemology",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://plato.stanford.edu/entries/plato/",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"firstName": "Richard",
						"lastName": "Kraut",
						"creatorType": "author"
					},
					{
						"firstName": "Edward N.",
						"lastName": "Zalta",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [
					"abstract objects",
					"Aristotle",
					"education, philosophy of",
					"epistemology",
					"metaphysics",
					"Plato: ethics and politics in The Republic",
					"religion: and morality",
					"Socrates",
					"Socratic Dialogues"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "SEP - Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Plato",
				"publicationTitle": "The Stanford Encyclopedia of Philosophy",
				"url": "http://plato.stanford.edu/archives/sum2012/entries/plato/",
				"date": "2012",
				"edition": "Summer 2012",
				"abstractNote": "Plato (429–347 B.C.E.) is, by any reckoning, one of the mostdazzling writers in the Western literary tradition and one of the mostpenetrating, wide-ranging, and influential authors in the history ofphilosophy. An Athenian citizen of high status, he displays in hisworks his absorption in the political events and intellectual movementsof his time, but the questions he raises are so profound and thestrategies he uses for tackling them so richly suggestive andprovocative that educated readers of nearly every period have in someway been influenced by him, and in practically every age there havebeen philosophers who count themselves Platonists in some importantrespects. He was not the first thinker or writer to whom the word“philosopher” should be applied. But he was soself-conscious about how philosophy should be conceived, and what itsscope and ambitions properly are, and he so transformed theintellectual currents with which he grappled, that the subject ofphilosophy, as it is often conceived—a rigorous and systematicexamination of ethical, political, metaphysical, and epistemologicalissues, armed with a distinctive method—can be called hisinvention. Few other authors in the history of Western philosophy approximatehim in depth and range: perhaps only Aristotle (who studied with him),Aquinas, and Kant would be generally agreed to be of the same rank.",
				"libraryCatalog": "Stanford Encyclopedia of Philosophy",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/
