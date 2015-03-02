(function ( $ ) {
	
    String.prototype.replaceParameter = function (param, value) {
        return this.split(param).join(value);
    };

    $.fn.dndupload = function(  options ) {
       
	    var $this = this;
	    
		var existResource = false;
		
		var defaults = {
		
			emptyResourceText: "Drag and drop<br/>or<br/> click!",
			
			dropZoneTemplate: '<div class="upload-drop-zone" >'+
						'<div class="dndUploadMessage">{message}</div>'+

						'<img/>'+

						'<audio src="#">'+                                                    
                                                '</audio>'+
						'<button type="button" class="btn btn-default btn-lg hidden play-audio">'+
							'<span class="glyphicon glyphicon-play" aria-hidden="true"></span>'+
						'</button>'+
  
						'<div class="upload-tools hidden">'+
							'<div class="btn btn-xs btn-default delete-file" title="Remove">'+
								'<i class="glyphicon glyphicon-trash" style="color:red"></i>'+
							'</div>'+
						'</div>'+

                                                '<div class="progress hidden" style="width:100%;">'+
							'<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">'+			
							'</div>'+
						'</div>'+
					   '</div>',			
			
			formTemplate:'<form action="" method="post" enctype="multipart/form-data" id="js-upload-form" class="hidden">'+
					   '<input type="file" name="file" class="js-upload-file">'+      
				     '</form>',
						 
						 
			deleteUrl:"#",
			uploadUrl:"#",
                        initialImageUrl:"#",
                        initialAudioUrl:"#",

                        extraDeleteData:{},
                        extraUploadData:{},    
			
			onBeforeUpload:function(){},
			onAfterUpload:function(){},
			
			onBeforeDelete:function(action){
                            action();
                        },

			onAfterDelete:function(){},

                        widthImage:160,
                        
                        maxImageWidth : 158,
                        maxImageHeight : 200, 
                        maxImageSize: 5242880,

                        maxAudioSize: 2621140,
			
                        acceptedTypes : {
				'image/png': true,
				'image/jpeg': true,
				'image/jpg': true,
				'image/gif': true,

                                'audio/mp3':true,
                                'audio/mpeg3':true,
                                'audio/x-mpeg-3':true
			},

                        showErrorMessage:function(info){
                        },
  
			onSuccessUpload:function(response){				
				if (!response.success){
                                   alert(response.errorMessage.error);
                                }			
			},
			
			onErrorUpload:function(response){				
			},
			
			onClick:function(){								
                                // $("input[class='js-upload-file']").click();
				$this.find(".js-upload-file").click();
			},
			
			onChange: function(event){				
				var input = event.currentTarget;				
				if (input.files && input.files[0]) {				    
					$this.previewUploadFile(input.files[0]);	
				}    	
			},
			
			onMouseOver: function(){	
				if (existResource){ 
					$this.find(".upload-tools").removeClass("hidden"); 
				}
			},
			
			onMouseOut: function(){
				if (existResource){ 
					$this.find(".upload-tools").addClass("hidden"); 
				}
			},
			
			startUpload : function(file) {
				console.log("Upload file..."+file)
			},
			
			onDrop : function(e) {
				e.preventDefault();
				$this.removeClass("drop");
				existResource = false; 
				var file = e.originalEvent.dataTransfer.files[0];
				$this.readFile(file);
				$this.settings.startUpload(file);
			},

			onDragOver : function() {
				$this.addClass("drop");
				return false;
			},

			onDragLeave : function() {
				$this.removeClass("drop");
				return false;
			},
			
                        onErrorDeleteFile:function(data){
                        },

			onDeleteFile : function(e) {
				e.stopPropagation();

				$this.settings.onBeforeDelete( $this.settings.deleteFile );	
			},

                        deleteFile : function(){
                                var deleteUrl=$this.settings.deleteUrl;
                                $.post(deleteUrl,
				        $this.settings.extraDeleteData, 
				        function(data) {
					      var data = eval('(' + data + ')');
					      if (data.success==true){
                                                           
							var image = new Image();
				                        $this.find(".upload-drop-zone > img").replaceWith(image);
				                        $this.find(".dndUploadMessage").removeClass("hidden"); 
				
                                                        $this.previewAudioFile(initialAudioUrl,true); 

				                        existResource = false;    
				                        $this.find(".upload-tools").addClass("hidden"); 
					      }else{
                                                        $this.settings.onErrorDeleteFile(data);
							var imgError=data.errorMessage["error"];	     		    
					    		appDialog.showDefault("Eroare",messages[imgError],120);	
					      }	  			
														  	  			  					  	  									  					  	  										
				});	
                        }
		}
				
		$this.settings = {}
		var init = function() {         
		
			$this.settings = $.extend({}, defaults, options);			
                        var dropZoneTemplate = $this.settings.dropZoneTemplate.replaceParameter("{message}",
                                                                          $this.settings.emptyResourceText); 
			$container = $(document.createElement("span")).html(
                                dropZoneTemplate+
				$this.settings.formTemplate);	
				
			$this.html( $container );	
			$this.off('click').on('click', '.upload-drop-zone',$.proxy($this.settings.onClick, $this));	
			$this.off('change').on('change', '.js-upload-file',$.proxy($this.settings.onChange, $this));	

			$this.off('mouseover').on('mouseover', '.upload-drop-zone',$.proxy($this.settings.onMouseOver, $this));	
			$this.off('mouseout').on('mouseout', '.upload-drop-zone',$.proxy($this.settings.onMouseOut, $this));						

			$this.off('drop').on('drop', '.upload-drop-zone',$.proxy($this.settings.onDrop, $this));	
			$this.off('dragover').on('dragover', '.upload-drop-zone',$.proxy($this.settings.onDragOver, $this));	
			$this.off('dragleave').on('dragleave', '.upload-drop-zone',$.proxy($this.settings.onDragLeave, $this));		

			$this.on('click', '.delete-file',$.proxy($this.settings.onDeleteFile, $this));	
			
			$this.on('click', '.play-audio',$.proxy($this.playAudio, $this));		
		}
							
		var tests = {
			filereader: typeof FileReader != 'undefined',
			dnd: 'draggable' in document.createElement('span'),
			formdata: !!window.FormData,
			progress: "upload" in new XMLHttpRequest
		};
		
			
		$this.isAudio = function(file) {		
                    var type = file.type;
   
                    if (type == "audio/mp3" || 
                        type == "audio/mpeg3" || 
                        type == "audio/x-mpeg-3"){
                       return true;
                    }
                    return false; 
                }

                $this.isImage = function(file) {		
                    var type = file.type;
   
                    if (type == "image/png" || 
                        type == "image/jpeg" || 
                        type == "image/jpg" ||
                        type == "image/gif"){
                       return true; 
                    }
                    return false; 
                }
                
                $this.playAudio = function(e){
                        e.stopPropagation();
                        var audio= $this.find(".upload-drop-zone > audio");
                        var buttonIcon = audio.next().find("span:first-child");
                        var isPlay = buttonIcon.hasClass("glyphicon-play"); 
                        if (isPlay){
                                audio[0].play();
	                        buttonIcon.removeClass("glyphicon-play").addClass("glyphicon-pause");
                        }else{
                                audio[0].pause();
	                        buttonIcon.removeClass("glyphicon-pause").addClass("glyphicon-play");
                        }
                }
                
                $this.previewAudioFile = function(url,hidden){
                	var audio= $this.find(".upload-drop-zone > audio");
                	if (hidden){
                 	        audio[0].pause();
                		audio.next().addClass("hidden");
                	}else{
                        	audio.next().removeClass("hidden");                        
                        }

                        var audioSource= $this.find(".upload-drop-zone > audio");
                        audioSource.attr("src", url);
                } 

		$this.previewUploadFile = function(file) {		 
		  if (tests.filereader === true && $this.settings.acceptedTypes[file.type] === true) {
			var reader = new FileReader();
			reader.onload = function (event) {
                                if ($this.isImage(file)){ 
				    var image = new Image();
				    image.src = event.target.result;
				    image.onload = function() {
					console.log(this.width+" x "+this.height);

                                        var dimensions = $this.resizeImage(this,$this.settings.maxImageWidth ,$this.settings.maxImageHeight);
                                        
                                        console.log(dimensions );
					this.width = dimensions.width; 											        
					this.height= dimensions.height; 	
					$this.find(".upload-drop-zone > img").replaceWith(image);												
							        
			            };

                                    $this.find(".dndUploadMessage").addClass("hidden");  
                                }else if($this.isAudio(file)){
                                    $this.previewAudioFile(event.target.result,false );  
                                }
			        			      
 				$this.find(".dndUploadMessage").addClass("hidden");   
			};

			reader.readAsDataURL(file);
		  } 
		};  

                $this.resizeImage = function(image,maxWidth,maxHeight){
		        var ratio = 0;  // Used for aspect ratio
		        var width = image.width;    // Current image width
		        var height = image.height;  // Current image height
		 
		        imageWidth = width;
		        imageHeight = height;
		            
		        // Check if the current width is larger than the max
		        if(width > maxWidth){
		            ratio = maxWidth / width;   // get ratio for scaling image
		            
		            imageWidth = maxWidth;
		            imageHeight = height * ratio;
		            
		            height = height * ratio;    // Reset height to match scaled image
		            width = width * ratio;    // Reset width to match scaled image
		        }
		 
		        // Check if current height is larger than max
		        if(height > maxHeight){
		            ratio = maxHeight / height; // get ratio for scaling image
		            
		            imageWidth = width * ratio;
		            imageHeight = maxHeight;
		            		            
		            width = width * ratio;    // Reset width to match scaled image
		        }
		        
		        return {width:imageWidth, height:imageHeight};
                }

		$this.readFile = function readFile(file) {  

                        // verificari
                        if(!$this.settings.acceptedTypes[file.type]){
                            $this.settings.showErrorMessage(["upload.invalidFile",file.type]);
                            return;
                        } 

                        if ($this.isImage(file)){ 
                            if (file.size>$this.settings.maxImageSize){ 
                                $this.settings.showErrorMessage(["uploadImage.limit",file.size]);
                                return;
                            }
                        }else if ($this.isAudio(file)){
                            if (file.size>$this.settings.maxAudioSize){ 
                                $this.settings.showErrorMessage(["uploadAudio.limit",file.size]);
                                return;
                            }
                        }

			var formData = tests.formdata ? new FormData() : null;
			formData.append("file", file);
                        
                        formData.append("id", $this.settings.extraUploadData.id); // TODO: de tinut cont de toti parametrii

                        var progressBar = $this.find(".progress-bar"); 
                        progressBar.css("width","0%");   
                        progressBar.attr("aria-valuenow",0);  
                        var progress = $this.find(".progress"); 
			progress.removeClass("hidden"); 

			$this.previewUploadFile(file);
 
			if (tests.formdata) {
				var xhr = new XMLHttpRequest();
				xhr.open('POST', $this.settings.uploadUrl);
				xhr.onreadystatechange=function(){
				
					if (xhr.readyState==4){
						if (xhr.status==200){
							$this.settings.onSuccessUpload(JSON.parse(xhr.responseText));						
						}else{
							$this.settings.onErrorUpload(JSON.parse(xhr.responseText));
						}					    
					}
 
					
				};
				xhr.onload = function() {
                                       
	                                progressBar.css("width","100%");   
                                        progressBar.attr("aria-valuenow",100);  

                                        progress.addClass("hidden"); 

                                        existResource = true;                                                                                
                                   
				};

				if (tests.progress) {
					xhr.upload.onprogress = function (event) {
						if (event.lengthComputable) {
							var complete = (event.loaded / event.total * 100 | 0);

							progressBar.css("width",complete+"%");   
                                                        progressBar.attr("aria-valuenow",complete);     
						}
					}
				}

				xhr.send(formData);
			}
                       
		}
				
		init();

                var initialImageUrl = $this.settings.initialImageUrl;
                if (initialImageUrl != "#"){
		       var image = $this.find(".upload-drop-zone > img");
                       image.attr("src", initialImageUrl);                      
                       existResource = true;  
		       $this.find(".dndUploadMessage").addClass("hidden"); 
		 
                }
 
                var initialAudioUrl = $this.settings.initialAudioUrl;
                if (initialAudioUrl != "#"){                               
                       $this.previewAudioFile(initialAudioUrl,false);
		       $this.find(".dndUploadMessage").addClass("hidden"); 
                       existResource = true;  
                }
                return this;
 
    };
		
}( jQuery ));