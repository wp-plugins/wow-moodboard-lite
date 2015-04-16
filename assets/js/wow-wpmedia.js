/* Part of Name: WoW Moodboard Lite / Pro
   Version: 2015.04.16
   Author: Marc Schot
   Description: Include the WordPress Media Manager
   Status: Production
   
   Load before </body>
*/

;(

function( window, document, plupload, o, $ ) 
{

	var uploaders = {};	
	
	// Translate Strings used in the uploader
	function _plpuploadtranslate(str) {
		return plupload.translate(str) || str;
	}

	
	// Create HTML for the uploader
	function renderUI( obj ) 
	{		
		obj.html(
			'<div class="plupload_container">' +
				'<div class="plupload_content" style="display: none;">' +
					'<ul class="plupload_filelist_content"> </ul>' +
				'</div>' +
				'<table class="plupload_filelist plupload_filelist_footer ui-widget-header">' +
				'<tr>' +
					'<td class="plupload_cell plupload_file_name">' +
						'<div class="plupload_buttons">' +
							'<a class="plupload_button plupload_add">' + _plpuploadtranslate("Add Files") + '</a>' +
						'</div>' +
						'<div class="plupload_started plupload_hidden">' +
							'<div class="plupload_progress plupload_right">' +
								'<div class="plupload_progress_container"></div>' +
							'</div>' +
							'<div class="plupload_cell plupload_upload_status"></div>' +
							'<div class="plupload_clearer">&nbsp;</div>' +
						'</div>' +
					'</td>' +
				'</tr>' +
				'</table>' +
				'<input class="plupload_count" value="0" type="hidden">' +
			'</div>'
		);
	}


	// Activate the jQuery for the uploader
	jQuery.widget( "ui.plupload", {

		widgetEventPrefix: '',
		contents_bak: '',	
	
		options: 
		{
			browse_button_hover: 'ui-state-hover',
			browse_button_active: 'ui-state-active',

			filters: 
			{ 
				title : "Image files", 
				extensions : "jpg,jpeg,gif,png"
			},
		
			// widget specific
			buttons: 
			{
				browse: true,
				start: false,
				stop: false	
			},
		
			views: 
			{
				list: true,
				thumbs: false,
				remember: false
			},

			multiple_queues: true, 
			dragdrop : true, 
			autostart: true,
			sortable: false,
			rename: false,
			unique_names: true,
		},
	
		FILE_COUNT_ERROR: -9001,
	
		_create: function() 
		{
			var id = this.element.attr('id');
			if (!id) 
			{
				id = plupload.guid();
				this.element.attr('id', id);
			}
			this.id = id;
				
			// backup the elements initial state
			this.contents_bak = this.element.html();
			renderUI( this.element );
		
			// container, just in case
			this.container = jQuery('.plupload_container', this.element).attr('id', id + '_container');	
			this.content = jQuery('.plupload_content', this.element);		
		
			// list of files, may become sortable
			this.filelist = jQuery('.plupload_filelist_content', this.container).attr(
			{
				id: id + '_filelist',
				unselectable: 'on'
			});
		

			// buttons
			this.browse_button = jQuery('.plupload_add', this.container).attr('id', id + '_browse');
		
			if (jQuery.ui.button) 
			{
				this.browse_button.button(
				{
					icons: { primary: 'ui-icon-circle-plus' },
					disabled: true
				});			      
			}
		
			// progressbar
			this.progressbar = jQuery('.plupload_progress_container', this.container);		
		
			if (jQuery.ui.progressbar) 
			{
				this.progressbar.progressbar();
			}
		
			// counter
			this.counter = jQuery('.plupload_count', this.element).attr(
			{
				id: id + '_count',
				name: id + '_count'
			});
					
			// initialize uploader instance
			this._initUploader();
		},

		_initUploader: function() 
		{
			var self = this
			, id = this.id
			, uploader
			, options = { 
				container: id + '_buttons',
				browse_button: id + '_browse'
			};

			jQuery('.plupload_buttons', this.element).attr('id', id + '_buttons');

			if (self.options.dragdrop) 
			{
				this.filelist.parent().attr('id', this.id + '_dropbox');
				options.drop_element = this.id + '_dropbox';
			}

			uploader = this.uploader = uploaders[id] = new plupload.Uploader(jQuery.extend(this.options, options));

			// for backward compatibility
			if (self.options.max_file_count) 
			{
				plupload.extend(uploader.getOption('filters'), {
					max_file_count: self.options.max_file_count
				});
			}

			plupload.addFileFilter('max_file_count', function(maxCount, file, cb) 
			{
				if (maxCount <= this.files.length - (this.total.uploaded + this.total.failed)) 
				{
					self.browse_button.button('disable');
					this.disableBrowse();
				
					this.trigger('Error', {
						code : self.FILE_COUNT_ERROR,
						message : _plpuploadtranslate("File count error."),
						file : file
					});
					cb(false);
				} else {
					cb(true);
				}
			});


			uploader.bind('Error', function(up, err) 
			{			
				var message, details = "";

				message = '<strong>' + err.message + '</strong>';
				
				switch (err.code) 
				{
					case plupload.FILE_EXTENSION_ERROR:
						details = o.sprintf(_plpuploadtranslate("File: %s"), err.file.name);
						break;
				
					case plupload.FILE_SIZE_ERROR:
						details = o.sprintf(_plpuploadtranslate("File: %s, size: %d, max file size: %d"), err.file.name,  plupload.formatSize(err.file.size), plupload.formatSize(plupload.parseSize(up.getOption('filters').max_file_size)));
						break;

					case plupload.FILE_DUPLICATE_ERROR:
						details = o.sprintf(_plpuploadtranslate("%s already present in the queue."), err.file.name);
						break;
					
					case self.FILE_COUNT_ERROR:
						details = o.sprintf(_plpuploadtranslate("Upload element accepts only %d file(s) at a time. Extra files were stripped."), up.getOption('filters').max_file_count || 0);
						break;
				
					case plupload.IMAGE_FORMAT_ERROR :
						details = _plpuploadtranslate("Image format either wrong or not supported.");
						break;	
				
					case plupload.IMAGE_MEMORY_ERROR :
						details = _plpuploadtranslate("Runtime ran out of available memory.");
						break;
																
					case plupload.HTTP_ERROR:
						details = _plpuploadtranslate("Upload URL might be wrong or doesn't exist.");
						break;
				}

				message += " <br /><i>" + details + "</i>";

				self._trigger('error', null, { up: up, error: err } );

				// do not show UI if no runtime can be initialized
				if (err.code === plupload.INIT_ERROR) 
				{
					setTimeout(function() 
					{
						self.destroy();
					}, 1);
				} else {
					self.notify('error', message);
				}
			});

		
			uploader.bind('PostInit', function(up) 
			{	
				// all buttons are optional, so they can be disabled and hidden
				if (!self.options.buttons.browse) 
				{
					self.browse_button.button('disable').hide();
					up.disableBrowse(true);
				} else {
					self.browse_button.button('enable');
				}
			
				if (self.options.dragdrop && up.features.dragdrop) 
				{
					self.filelist.parent().addClass('plupload_dropbox');
				}

				self._trigger('ready', null, { up: up });
			});
		
			// uploader internal events must run first 
			uploader.init();

			uploader.bind('FilesAdded', function(up, files) {
				self._trigger('selected', null, { up: up, files: files } );

			// re-enable sortable
			if (self.options.sortable && $.ui.sortable) {
				self._enableSortingList();	
			}

			self._trigger('updatelist', null, { filelist: self.filelist });
			
			if (self.options.autostart) {
				// set a little delay to make sure that QueueChanged triggered by the core has time to complete
				setTimeout(function() {
					self.start();
				}, 10);
			}
		});
		
		uploader.bind('FilesRemoved', function(up, files) {
			// destroy sortable if enabled
			if ($.ui.sortable && self.options.sortable) {
				$('tbody', self.filelist).sortable('destroy');	
			}

			$.each(files, function(i, file) {
				$('#' + file.id).toggle("highlight", function() {
					$(this).remove();
				});
			});
			
			if (up.files.length) {
				// re-initialize sortable
				if (self.options.sortable && $.ui.sortable) {
					self._enableSortingList();	
				}
			}

			self._trigger('updatelist', null, { filelist: self.filelist });
			self._trigger('removed', null, { up: up, files: files } );
		});
		
		uploader.bind('QueueChanged StateChanged', function() {
			self._handleState();
		});
		
		uploader.bind('UploadFile', function(up, file) {
			self._handleFileStatus(file);
		});
		
		uploader.bind('FileUploaded', function(up, file, response) {
			self._handleFileStatus(file);
			self._trigger('uploaded', null, { up: up, file: file } );
			
			// Retreive the information of the image we have just uploaded and add it to the grey bar
			var uploadedimageresult = JSON.parse(response.response);
			
			if ( uploadedimageresult.success === true ) 
			{
				// Grab our content div, show clear results button.
				jQuery( "#clearsearchresults" ).show();	
				var contentDiv = document.getElementById('wowcanvasimages');
				
				var result       = new Array();
				var imgContainer = document.createElement('div');
				var newImg       = document.createElement('img');
				
				var uniqueid     = uploadedimageresult.data.sizes.full.url.hashCode();
				
				var imgEl    = new Image();
				imgEl.onload = function() 
				{
					newImg.src = uploadedimageresult.data.sizes.thumbnail.url; 
	
					newImg.id  = "imageresult" + uniqueid;			
					imgContainer.appendChild(newImg);
					imgContainer.className = "scroll-content-item";
				
					contentDiv.insertBefore( imgContainer, contentDiv.firstChild );
				
					result.type 		= "uploaded#image";
					result.unescapedUrl = uploadedimageresult.data.sizes.full.url;
					result.width 		= uploadedimageresult.data.sizes.full.width;
					result.height		= uploadedimageresult.data.sizes.full.height;
					result.tbWidth 		= uploadedimageresult.data.sizes.thumbnail.width;
					result.tbHeight		= uploadedimageresult.data.sizes.thumbnail.height;
					result.tbUrl		= uploadedimageresult.data.sizes.thumbnail.url;
					result.title		= "";
				
					setDraggable( "#imageresult" + uniqueid, result);
				
					//init scrollbar size
					sizeScrollbar();
					reflowContent();	
					resetValue();			
				};
				imgEl.src    = uploadedimageresult.data.sizes.thumbnail.url; 
				
				
			}						
		});
				
		uploader.bind('UploadProgress', function(up, file) {
			self._handleFileStatus(file);
			self._updateTotalProgress();
			  self._trigger('progress', null, { up: up, file: file } );
		});
		
		uploader.bind('UploadComplete', function(up, files) {
			self._addFormFields();		
			self._trigger('complete', null, { up: up, files: files } );
		});
	},

	
	_setOption: function(key, value) {
		var self = this;

		if (key == 'buttons' && typeof(value) == 'object') {	
			value = $.extend(self.options.buttons, value);
			
			if (!value.browse) {
				self.browse_button.button('disable').hide();
				self.uploader.disableBrowse(true);
			} else {
				self.browse_button.button('enable').show();
				self.uploader.disableBrowse(false);
			}
			
		}
		
		self.uploader.settings[key] = value;	
	},

	
	/**
	Start upload. Triggers `start` event.

	@method start
	*/
	start: function() {
		this.uploader.start();
		this._trigger('start', null, { up: this.uploader });
	},

	
	/**
	Stop upload. Triggers `stop` event.

	@method stop
	*/
	stop: function() {
		this.uploader.stop();
		this._trigger('stop', null, { up: this.uploader });
	},


	/**
	Enable browse button.

	@method enable
	*/
	enable: function() {
		this.browse_button.button('enable');
		this.uploader.disableBrowse(false);
	},


	/**
	Disable browse button.

	@method disable
	*/
	disable: function() {
		this.browse_button.button('disable');
		this.uploader.disableBrowse(true);
	},

	
	/**
	Retrieve file by it's unique id.

	@method getFile
	@param {String} id Unique id of the file
	@return {plupload.File}
	*/
	getFile: function(id) {
		var file;
		
		if (typeof id === 'number') {
			file = this.uploader.files[id];	
		} else {
			file = this.uploader.getFile(id);	
		}
		return file;
	},

	/**
	Return array of files currently in the queue.
	
	@method getFiles
	@return {Array} Array of files in the queue represented by plupload.File objects
	*/
	getFiles: function() {
		return this.uploader.files;
	},

	
	/**
	Remove the file from the queue.

	@method removeFile
	@param {plupload.File|String} file File to remove, might be specified directly or by it's unique id
	*/
	removeFile: function(file) {
		if (plupload.typeOf(file) === 'string') {
			file = this.getFile(file);
		}
		this.uploader.removeFile(file);
	},

	
	/**
	Clear the file queue.

	@method clearQueue
	*/
	clearQueue: function() {
		this.uploader.splice();
	},


	/**
	Retrieve internal plupload.Uploader object (usually not required).

	@method getUploader
	@return {plupload.Uploader}
	*/
	getUploader: function() {
		return this.uploader;
	},


	/**
	Trigger refresh procedure, specifically browse_button re-measure and re-position operations.
	Might get handy, when UI Widget is placed within the popup, that is constantly hidden and shown
	again - without calling this method after each show operation, dialog trigger might get displaced
	and disfunctional.

	@method refresh
	*/
	refresh: function() {
		this.uploader.refresh();
	},


	/**
	Display a message in notification area.

	@method notify
	@param {Enum} type Type of the message, either `error` or `info`
	@param {String} message The text message to display.
	*/
	notify: function(type, message) {
		var popup = $(
			'<div class="plupload_message">' + 
				'<span class="plupload_message_close ui-icon ui-icon-circle-close" title="'+_plpuploadtranslate('Close')+'"></span>' +
				'<p><span class="ui-icon"></span>' + message + '</p>' +
			'</div>'
		);
					
		popup
			.addClass('ui-state-' + (type === 'error' ? 'error' : 'highlight'))
			.find('p .ui-icon')
				.addClass('ui-icon-' + (type === 'error' ? 'alert' : 'info'))
				.end()
			.find('.plupload_message_close')
				.click(function() {
					popup.remove();	
				})
				.end();
		
		$('.plupload_header', this.container).append(popup);
	},

	
	/**
	Destroy the widget, the uploader, free associated resources and bring back original html.

	@method destroy
	*/
	destroy: function() {		
		// destroy uploader instance
		this.uploader.destroy();

		// unbind all button events
		$('.plupload_button', this.element).unbind();
		
		// destroy buttons
		if ($.ui.button) {
			$('.plupload_add, .plupload_start, .plupload_stop', this.container)
				.button('destroy');
		}
		
		// destroy progressbar
		if ($.ui.progressbar) {
			this.progressbar.progressbar('destroy');	
		}
		
		// destroy sortable behavior
		if ($.ui.sortable && this.options.sortable) {
			$('tbody', this.filelist).sortable('destroy');
		}
		
		// restore the elements initial state
		this.element
			.empty()
			.html(this.contents_bak);
		this.contents_bak = '';

		$.Widget.prototype.destroy.apply(this);
	},
	
	
	_handleState: function() {
		var up = this.uploader
		, filesPending = up.files.length - (up.total.uploaded + up.total.failed)
		, maxCount = up.getOption('filters').max_file_count || 0
		;
						
		if (plupload.STARTED === up.state) {			
			$([])
				.add('.plupload_started')
					.removeClass('plupload_hidden');


			if (!this.options.multiple_queues) {
				this.browse_button.button('disable');
				up.disableBrowse();
			}
							
			$('.plupload_upload_status', this.element).html(o.sprintf(_plpuploadtranslate('Uploaded %d/%d files'), up.total.uploaded, up.files.length));
			$('.plupload_header_content', this.element).addClass('plupload_header_content_bw');
		} 
		else if (plupload.STOPPED === up.state) {
			$([])
				.add('.plupload_started')
					.addClass('plupload_hidden');

			
			if (this.options.multiple_queues) {
				$('.plupload_header_content', this.element).removeClass('plupload_header_content_bw');
			} 

			// if max_file_count defined, only that many files can be queued at once
			if (this.options.multiple_queues && maxCount && maxCount > filesPending) {
				this.browse_button.button('enable');
				up.disableBrowse(false);
			}

			this._updateTotalProgress();
		}

		if (up.total.queued === 0) {
			$('.ui-button-text', this.browse_button).html(_plpuploadtranslate('Add Files'));
		} else {
			$('.ui-button-text', this.browse_button).html(o.sprintf(_plpuploadtranslate('%d files queued'), up.total.queued));
		}

		up.refresh();
	},

	
	_handleFileStatus: function(file) {
		var $file = $('#' + file.id), actionClass, iconClass;
		
		// since this method might be called asynchronously, file row might not yet be rendered
		if (!$file.length) {
			return;	
		}

		switch (file.status) {
			case plupload.DONE: 
				actionClass = 'plupload_done';
				iconClass = 'plupload_action_icon ui-icon ui-icon-circle-check';
				break;
			
			case plupload.FAILED:
				actionClass = 'ui-state-error plupload_failed';
				iconClass = 'plupload_action_icon ui-icon ui-icon-alert';
				break;

			case plupload.QUEUED:
				actionClass = 'plupload_delete';
				iconClass = 'plupload_action_icon ui-icon ui-icon-circle-minus';
				break;

			case plupload.UPLOADING:
				actionClass = 'ui-state-highlight plupload_uploading';
				iconClass = 'plupload_action_icon ui-icon ui-icon-circle-arrow-w';
				
				// scroll uploading file into the view if its bottom boundary is out of it
				var scroller = $('.plupload_scroll', this.container)
				, scrollTop = scroller.scrollTop()
				, scrollerHeight = scroller.height()
				, rowOffset = $file.position().top + $file.height()
				;
					
				if (scrollerHeight < rowOffset) {
					scroller.scrollTop(scrollTop + rowOffset - scrollerHeight);
				}		

				// Set file specific progress
				$file
					.find('.plupload_file_percent')
						.html(file.percent + '%')
						.end()
					.find('.plupload_file_progress')
						.css('width', file.percent + '%')
						.end()
					.find('.plupload_file_size')
						.html(plupload.formatSize(file.size));			
				break;
		}
		actionClass += ' ui-state-default plupload_file';

		$file
			.attr('class', actionClass)
			.find('.plupload_action_icon')
				.attr('class', iconClass);
	},
	
	
	_updateTotalProgress: function() {
		var up = this.uploader;

		// Scroll to end of file list
		this.filelist[0].scrollTop = this.filelist[0].scrollHeight;
		
		this.progressbar.progressbar('value', up.total.percent);
		
		this.element
			.find('.plupload_total_status')
				.html(up.total.percent + '%')
				.end()
			.find('.plupload_total_file_size')
				.html(plupload.formatSize(up.total.size))
				.end()
			.find('.plupload_upload_status')
				.html(o.sprintf(_plpuploadtranslate('Uploaded %d/%d files'), up.total.uploaded, up.files.length));
	},


	_displayThumbs: function() {
		var self = this
		, tw, th // thumb width/height
		, cols
		, num = 0 // number of simultaneously visible thumbs
		, thumbs = [] // array of thumbs to preload at any given moment
		, loading = false
		;

		if (!this.options.views.thumbs) {
			return;
		}


		function onLast(el, eventName, cb) {
			var timer;
			
			el.on(eventName, function() {
				clearTimeout(timer);
				timer = setTimeout(function() {
					clearTimeout(timer);
					cb();
				}, 300);
			});
		}


		// calculate number of simultaneously visible thumbs
		function measure() {
			if (!tw || !th) {
				var wrapper = $('.plupload_file:eq(0)', self.filelist);
				tw = wrapper.outerWidth(true);
				th = wrapper.outerHeight(true);
			}

			var aw = self.content.width(), ah = self.content.height();
			cols = Math.floor(aw / tw);
			num =  cols * (Math.ceil(ah / th) + 1);
		}


		function pickThumbsToLoad() {
			// calculate index of virst visible thumb
			var startIdx = Math.floor(self.content.scrollTop() / th) * cols;
			// get potentially visible thumbs that are not yet visible
			thumbs = $('.plupload_file', self.filelist)
				.slice(startIdx, startIdx + num)
				.filter('.plupload_file_loading')
				.get();
		}
		

		function init() {
			function mpl() { // measure, pick, load
				if (self.view_mode !== 'thumbs') {
					return;
				}
				measure();
				pickThumbsToLoad();
				lazyLoad();
			}

			if ($.fn.resizable) {
				onLast(self.container, 'resize', mpl);
			}

			onLast(self.window, 'resize', mpl);
			onLast(self.content, 'scroll',  mpl);

			self.element.on('viewchanged selected', mpl);

			mpl();
		}


		function preloadThumb(file, cb) {
			var img = new o.Image();

			img.onload = function() {
				var thumb = $('#' + file.id + ' .plupload_file_thumb', self.filelist).html('');
				this.embed(thumb[0], { 
					height: self.options.thumb_height, 
					crop: false,
					swf_url: o.resolveUrl(self.options.flash_swf_url),
					xap_url: o.resolveUrl(self.options.silverlight_xap_url)
				});
			};

			img.bind("embedded error", function() {
				$('#' + file.id, self.filelist).removeClass('plupload_file_loading');
				this.destroy();
				setTimeout(cb, 1); // detach, otherwise ui might hang (in SilverLight for example)
			});

			img.load(file.getSource());
		}


		function lazyLoad() {
			if (self.view_mode !== 'thumbs' || loading) {
				return;
			}	

			pickThumbsToLoad();
			if (!thumbs.length) {
				return;
			}

			loading = true;

			preloadThumb(self.getFile($(thumbs.shift()).attr('id')), function() {
				loading = false;
				lazyLoad();
			});
		}

		// this has to run only once to measure structures and bind listeners
		this.element.on('selected', function onselected() {
			self.element.off('selected', onselected);
			init();
		});
	},


	_addFormFields: function() {
		var self = this;

		// re-add from fresh
		$('.plupload_file_fields', this.filelist).html('');

		plupload.each(this.uploader.files, function(file, count) {
			var fields = ''
			, id = self.id + '_' + count
			;

			if (file.target_name) {
				fields += '<input type="hidden" name="' + id + '_tmpname" value="'+plupload.xmlEncode(file.target_name)+'" />';
			}
			fields += '<input type="hidden" name="' + id + '_name" value="'+plupload.xmlEncode(file.name)+'" />';
			fields += '<input type="hidden" name="' + id + '_status" value="' + (file.status === plupload.DONE ? 'done' : 'failed') + '" />';

			$('#' + file.id).find('.plupload_file_fields').html(fields);
		});
		

		this.counter.val(this.uploader.files.length);
	},
	



});

} ( window, document, plupload, mOxie, jQuery )

);