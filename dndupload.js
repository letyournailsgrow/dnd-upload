(function ( $ ) {
	
    $.fn.dndupload = function(  options ) {
       
	    var $this = this;
	    
		var existResource = false;
		
		var defaults = {
		
			emptyResourceText: "Drag and drop<br/>or<br/> click!",
			
			dropZoneTemplate: '<div class="upload-drop-zone" >'+
						'<div class="emptyResource">Trage imaginea aici<br/> sau<br/> apasa click!</div>'+
						'<img/>'+
  
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

                        extraDeleteData:{},
                        extraUploadData:{},    
			
			onBeforeUpload:function(){},
			onAfterUpload:function(){},
			
			onBeforeDelete:function(action){
                            action();
                        },

			onAfterDelete:function(){},

                        widthImage:160,
			
			onClick:function(){								
				$("input[class='js-upload-file']").click();
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
				                        $this.find(".emptyResource").removeClass("hidden"); 
				
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
			
			$container = $(document.createElement("span")).html(
				$this.settings.dropZoneTemplate +
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
		}
							
		var tests = {
			filereader: typeof FileReader != 'undefined',
			dnd: 'draggable' in document.createElement('span'),
			formdata: !!window.FormData,
			progress: "upload" in new XMLHttpRequest
		};
		
		var acceptedTypes = {
			'image/png': true,
			'image/jpeg': true,
			'image/gif': true
		};		
		
		$this.previewUploadFile = function(file) {		 
		  if (tests.filereader === true && acceptedTypes[file.type] === true) {
			var reader = new FileReader();
			reader.onload = function (event) {
				var image = new Image();
				image.src = event.target.result;
				image.width = $this.settings.widthImage-4; 			
				$this.find(".upload-drop-zone > img").replaceWith(image);
				$this.find(".emptyResource").addClass("hidden");   
			};

			reader.readAsDataURL(file);
		  } 
		};  

		$this.readFile = function readFile(file) {   
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
				xhr.onload = function() {
                                       
	                                progressBar.css("width","100%");   
                                        progressBar.attr("aria-valuenow",100);  
                                        progress.addClass("hidden"); 
                                        existResource = true; 
                                        console.log(progress);
				};

				if (tests.progress) {
					xhr.upload.onprogress = function (event) {
						if (event.lengthComputable) {
							var complete = (event.loaded / event.total * 100 | 0);
							
                                                       
							progressBar.css("width",complete+"%");   
                                                        progressBar.attr("aria-valuenow",complete);     
                                                   
                                                        console.log(complete);
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
                       image.attr("width", $this.settings.widthImage-4);
                       existResource = true;  
		       $this.find(".emptyResource").addClass("hidden"); 
		 
                }
 
                return this;
 
    };
		
}( jQuery ));