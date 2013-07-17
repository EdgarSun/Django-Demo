var Event = Backbone.Model.extend({
	defaults: {
		index : 0,
		id : 0,
		authorName : "None",
		avatar : "avatar",
		authorID : 0,
		content : "None",
		pubDate : "2011-01-12",
		verbosePubDate : "None",
		tagID : 0,
		commentCount : 0,
		platform : "the earth"
	}
});

var EventStack = Backbone.Collection.extend({
	model : Event,
	initialize: function(options) {
        this.page = 1;
        this.pageTotal = 0;
        this.tagFilter = 0;
        this.maxDisplayItems = 0;
        this.parentID = 0;
    },
    refreshPageTotal: function(){
    	var pages = Math.floor( this.length/this.maxDisplayItems );
    	this.pageTotal = this.length%this.maxDisplayItems == 0? pages : pages + 1;
    },
	parse: function(response) {
	    return response.result;
	},
	add: function( model, options ){
	    // do your stuff
	    // call the real add
	    Backbone.Collection.prototype.add.call(this, model);
	    this.refreshPageTotal();

	  }
});
//	comparator : function(model){
//		return -model.get("pubDate");
//	}

//Initialize event collection
var events = new EventStack();

//--------------------------------------------------------------------------
//'title' : showcaseItem.title,
//'content' : showcaseItem.content,
//'resource' : showcaseItem.resource,
//'isPublished' : showcaseItem.isPublished,
//'spam' : showcaseItem.spam,
//'isShader' : showcaseItem.isShader,
//'tag_list' : showcaseItem.tag_list,
//'pub_date' : str(showcaseItem.pub_date)
var Showcase = Backbone.Model.extend({
	defaults: {
		id : 0,
		author: 'None',
		authorID: 0,
		content : "None",
		slugContent : "None",
		description : "None",
		resource : {},
		resource_url_list : {},
		isPublished : false,
		verbosePubDate : "2011-01-12",
		pub_date: "2011-01-12",
		tag_list : {},
		link_list : {},
		spam : false,
		isShader : false,
		isExternal :true //if the demo was collected from external, the property will be true
	}
});
var ShowcaseStack = Backbone.Collection.extend({
	model : Showcase,
	initialize: function(options) {
        this.page = 1;
        this.pageTotal = 0;
        this.maxDisplayItems = 0;
    },
    refreshPageTotal: function(){
    	var pages = Math.floor( this.length/this.maxDisplayItems );
    	this.pageTotal = this.length%this.maxDisplayItems == 0? pages : pages + 1;
    },
	parse: function(response) {
	    return response.result;
	},
	add: function( model, options ){
	    // do your stuff
	    // call the real add
	    Backbone.Collection.prototype.add.call(this, model);
	    this.refreshPageTotal();

	},
	comparator: function(model) {
	    //return model.get('pubDate'); // pubDate is name of Model property
	    var str = model.get('pub_date');        
	    str = str.split("");         
	    str = _.map(str, function(letter) { 
	      return String.fromCharCode(-(letter.charCodeAt(0))); 
	    });         
	    return str;
	}
});
//Initialize event collection
var m_showcase = new Showcase();
var showcaseStack = new ShowcaseStack();
//var published_ShowcaseStack = new ShowcaseStack;
