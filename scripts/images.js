/**
 * Images Script
 *
 * @package WikiDocs
 * @repository https://github.com/Zavy86/wikidocs
 */

/**
 *  Image picker
 */
//$(".image-picker").click(function(){
$('body').on('click','.image-picker',function(){
	image_tag=$(this).attr("image");
	simplemde.codemirror.replaceSelection('![]('+DOC.PATH+'/'+image_tag+')');
	$("#modal_uploader").modal("close");
});

/**
 * Form upload
 */
$("#images-uploader-form").on('submit',(function(e){
	// prevent default submit
	e.preventDefault();
	// lock buttons
	$("#uploader-submit").val("Uploading..");
	$("#uploader-submit").attr("disabled",true);
	$.ajax({
		url:$(this).attr('action'),
		type:"post",
		data:new FormData(this),
		contentType:false,
		cache:false,
		processData:false,
		success:function(response){
			// decode response
			decoded=JSON.parse(response);
			// alert if error
			if(decoded.error===1){
				alert(decoded.code);
			}else{
				// build image object
				image="<div class=\"col s6 m3\"><a href=\"#\" class=\"image-picker waves-effect waves-light\" image=\""+decoded.name+"\">";
				image+="<img class=\"polaroid\" src=\""+decoded.path+"\"/></a></div>";
				// append to images list
				$("#images-list").append(image);
			}
			// unlock buttons
			$("#uploader-path").val("");
			$("#uploader-submit").val("Upload");
			$("#uploader-submit").attr("disabled",false);
		},
		error:function(XMLHttpRequest,textStatus,errorThrown){
			// alert
			alert("Status: "+textStatus+" Error: "+errorThrown);
			// unlock buttons
			$("#uploader-submit").val("Upload");
			$("#uploader-submit").attr("disabled",false);
		}
	});
}));

/**
 * Retrieves the images from the clipboard as a base64 string and returns it in a callback.
 */
function retrieveImageFromClipboardAsBase64(pasteEvent,callback,imageFormat){
	if(pasteEvent.clipboardData==false){if(typeof(callback)=="function"){callback(undefined);}};
	var items=pasteEvent.clipboardData.items;
	if(items==undefined){if(typeof(callback)=="function"){callback(undefined);}};
	for(var i=0;i<items.length;i++){
		// skip content if not image
		if(items[i].type.indexOf("image")==-1){continue;}
		// retrieve image on clipboard as blob
		var blob=items[i].getAsFile();
		// create an abstract canvas and get context
		var mycanvas=document.createElement("canvas");
		var ctx=mycanvas.getContext('2d');
		// create an image
		var img=new Image();
		// render the image on the canvas
		img.onload=function(){
			// update the canvas size with the dimensions of the image
			mycanvas.width=this.width;
			mycanvas.height=this.height;
			// draw the image
			ctx.drawImage(img,0,0);
			// execute callback with the base64 URI of the image
			if(typeof(callback)=="function"){callback(mycanvas.toDataURL((imageFormat||"image/png")));}
		};
		// crossbrowser support for URL
		var URLObj=window.URL||window.webkitURL;
		// creates a DOMString containing a URL representing the object given in the parameter namely the original blob
		img.src=URLObj.createObjectURL(blob);
	}
}

// event listener
window.addEventListener("paste",function(e){
	// handle the event
	retrieveImageFromClipboardAsBase64(e, function(imageDataBase64){
		// check for image data
		if(imageDataBase64){
			//console.log(imageDataBase64);
			$.ajax({
				url:APP.PATH+"submit.php?act=image_upload_ajax",
				type:"post",
				dataType:"html",
				data:"document="+DOC.ID+"&image_base64="+imageDataBase64,
				cache:false,
				processData:false,
				success:function(response){
					console.log(response);
					// decode response
					decoded=JSON.parse(response);
					// alert if error
					if(decoded.error===1){
						alert(decoded.code);
					}else{
						// build image object
						image="<div class=\"col s6 m3\"><a href=\"#\" class=\"image-picker waves-effect waves-light\" image=\""+decoded.name+"\">";
						image+="<img class=\"polaroid\" src=\""+decoded.path+"\"/></a></div>";
						// append to images list
						$("#images-list").append(image);
						// add image to editor
						simplemde.codemirror.replaceSelection('![]('+decoded.path+')');
					}
				},
				error:function(XMLHttpRequest,textStatus,errorThrown){
					// alert
					alert("Status: "+textStatus+" Error: "+errorThrown);
				}
			});
		}
	});
},false);
