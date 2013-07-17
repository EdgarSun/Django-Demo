var message = "";
var images = {};

var widthList = new Array();
var heightList = new Array();
var leftList = new Array();
var topList = new Array();
var label_length = new Array();

var slugList = new Array();

var contents = new Array();
$(document).ready(function() {
	RetrieveShowcase();
});
function RetrieveShowcase(){
	var url = '/showcase/retrieve/matrix';
	$.getJSON(url,function(response) {
		widthList = response.result['width'];
		heightList = response.result['height'];
		leftList = response.result['left'];
		topList = response.result['top'];
		label_length = response.result['label_length'];
	})
	.complete(function() {
		RenderShowcase();
	});
}
function RenderShowcase(){
	var url = '/showcase/retrieve';
	var data = {
			'retrieve_count' : widthList.length,
			'isLimitedAuthor' : 0
	};
	$.getJSON(url,data,function(response) {
		var totalNum = response.published.length;
		var loadedImages = 0;
		for(var index in response.published){
			var showcase = response.published[index];
			contents.push(showcase.content);
			images[showcase.content] = new Image();
			slugList[index] = showcase.slugContent;
            images[showcase.content].onload = function(){
            	if(++loadedImages >= totalNum){
            		drawImages();
            	}
            };
            images[showcase.content].src = '/resource/media/' + showcase.resource[0].toString() + '/' + widthList[index].toString() + '/0';
		}
	});
}

function drawImages(){
    kin = new Kinetic_2d("showcase-canvas");

    kin.setDrawStage(function(){
        kin.clear();
        var context = kin.getContext();
        var index = 0;
        for(var content in images){
            // draw darth vader image and attach listeners
            kin.beginRegion();
            context.drawImage(images[content], leftList[index], topList[index], widthList[index],heightList[index]);
            // draw rectangular region for image
            context.beginPath();
            context.rect(leftList[index], topList[index], widthList[index],heightList[index]);
            context.closePath();

            kin.addRegionEventListener("onmouseover", function(){
                message = content;
            });
            kin.addRegionEventListener("onmouseout", function(){
                message = "";
            });
            kin.addRegionEventListener("onmousedown", function(){
                window.location.href = '/showcase/v/' + slugList[index];
            });
            kin.addRegionEventListener("onmouseup", function(){
                //message = "Darth Vader mouseup!";
            });
            kin.closeRegion();

            DrawLabel(context,content,index);

            index++;
        }
    });
}
function DrawLabel(context,content,index){
	var isMultpleLines = false;
	var contentArray = jQuery.trim(content).split(' ');
	var secondLineArray = new Array();
	if(content.length > label_length[index]){
		while(contentArray.join(' ').toString().length > label_length[index]){
			secondLineArray.push(contentArray.pop());
		}
		isMultpleLines = true;
		secondLineArray.reverse();
	}
	var fontSize = '';
	var labelHeight = 10;
	var textHeight = 6;
	
	//small size
	if(heightList[index] >=40 && heightList[index] <80){
		labelHeight = 10;
		textHeight = 6;
		fontSize = '8';
	}
	//medium size
	else if(heightList[index] >=80 && heightList[index] <160){
		if(isMultpleLines){
			labelHeight = 30;
		}
		else{
			labelHeight = 15;
		}
		fontSize = '10';
		textHeight = 11;
	}
	//large size
	else{
		
		if(isMultpleLines){
			labelHeight = 40;
		}
		else{
			labelHeight = 20;
		}
		fontSize = '12';
		textHeight = 14;
	}
	
	var labelTop = topList[index] + heightList[index] - labelHeight;
	
    if(labelHeight > 10){
        context.beginPath();
        context.rect(leftList[index], labelTop,widthList[index],labelHeight);
        context.fillStyle = "rgba(0,0,0,0.7)";
        context.fill();
        
        context.font = fontSize + "px Verdana";
        context.fillStyle = "white";
        
    	//draw the first line of label
        context.fillText(contentArray.join(' ').toString(), leftList[index]+3, labelTop + textHeight);
        
        //if label contains multiple lines, it will draw the second line
    	if(isMultpleLines){
            context.fillText(secondLineArray.join(' ').toString(), leftList[index]+3, labelTop + labelHeight/2 + textHeight);
    	}

        
        context.closePath();
    }
	
}

function WriteMessage(){
    var context = kin.getContext();
    context.font = "14px Verdana";
    context.fillStyle = "black";
    context.fillText(message, 10, 340);
}