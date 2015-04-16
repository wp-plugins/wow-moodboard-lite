<?php
/*
Part of Name: WoW Moodboard Lite
Plugin URI: http://wownmedia.com/wow-moodboard/
Description: The moodboard template for the Wow Moodboard Lite plugin.
Version: 1.1.0 [ 2015.04.06 ]
Author: Wow New Media
Author URI: http://wownmedia.com
License: GPLv2 or later

	WoW Moodboard, plugin for Wordpress.
	Copyright © 2015 Wow New Media

	Wow New Media
	info@wownmedia.com
	Buzon 621 Sta. Clara
	03599 Altea la Vella
	ALC Spain
	
*/
defined( 'WOWMOODBOARD' ) or die( 'No direct access to this file allowed.' );


if ( isset( $edit ) && $edit )
{
	// Prepare the css class to edit the moodboard
	$canvasclass = 'woweditcanvas';
}
else
{
	// Prepare the css class to simply show the moodboard
	$canvasclass = 'wowcanvas';
}

?>

<div id='moodboard'>	
<?php if ( isset( $edit ) && $edit ) : ?>
	<div id="editmode">   
    	<input type="checkbox" id="switcheditmode" >
        <label for="switcheditmode"><?php echo translate( 'Hide Edit-mode' ); ?></label>
    </div>
    <div id="wow-edit-panel" style='display:none;'>
	<div id='wowtabs' class='ui-tabs ui-widget ui-widget-content ui-corner-all'>
    	<ul class='ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all'>
        	<?php if ( !isset( $this->GoogleActive ) || $this->GoogleActive ) : ?>
        	<li class='wowtab'>
            	<a href='#googlesearch' class='ui-tabs-anchor'><?php echo translate( 'Google Images' ); ?></a>
            </li>
            <?php endif ?>
            <?php if ( !isset( $this->YouTubeActive ) || $this->YouTubeActive ) : ?>
            <li class='wowtab'>
            	<a class='ui-tabs-anchor' href='#youtube'><?php echo translate( 'Youtube' ); ?></a>
            </li>
            <?php endif ?>
            <?php if ( !isset( $this->UploadActive ) || $this->UploadActive ) : ?>
            <li class='wowtab'>
            	<a class='ui-tabs-anchor' href='#uploader'><?php echo translate( 'Upload' ); ?></a>
            </li>
            <?php endif ?>
		</ul>
        <?php if ( !isset( $this->YouTubeActive ) || $this->YouTubeActive ) : ?>
        <div id='youtube' class='ui-tabs-panel ui-widget-content' style='display:none;'>
        	<?php if ( ! $this->YoutubeAPI ) : ?>
            <div class="error"><?php echo translate( 'Please enter your Google API Key in the settings first' ); ?></div>
            <?php else : ?>
      		<label> 
               	<input id='youtubequery' value='' type='text'/>
                <button id='youtube-search-button' disabled onclick='youtubesearch()'><?php echo translate( 'Youtube Search' ); ?></button>
            </label>
            <?php endif ?>
        </div>
        <?php endif ?>
        <?php if ( !isset( $this->GoogleActive ) || $this->GoogleActive ) : ?>
        <div id='googlesearch' class='ui-tabs-panel ui-widget-content'>
        	<label> 
				<input type='text' id='googleimagesearchquery' value=''/>
				<span id='googlebranding' class='googlebranding'></span>
				<button id='image-search-button' disabled onclick='googleimagesearch()'><?php echo translate( 'Image Search' ); ?></button>
            </label>
        </div>
        <?php endif ?>
        <?php if ( !isset( $this->UploadActive ) || $this->UploadActive ) : ?>
        <div id='uploader' class='ui-tabs-panel ui-widget-content' style='display:none;'>
    			<p><?php echo translate( "Your browser doesn't have Flash, Silverlight or HTML5 support." ); ?></p>
                <script type='text/javascript'>
				document.addEventListener("DOMContentLoaded", function(event) 
				{
					wowupload( 	<?php echo json_encode( wp_create_nonce( 'media-form' ) ); ?>, 
								<?php echo json_encode( admin_url( 'async-upload.php' ) ); ?>, 
								<?php echo json_encode( includes_url( ) ); ?>
					)
				});
				</script>
		</div>
        <?php endif ?>
	</div>
    <div id='imagescroller' class="scroll-pane">
    	<label> 
			<button id='clearsearchresults' onclick='resetImageResults()' style='display:none;'><?php echo translate( 'Clear Results' ); ?></button>
        </label>
   		<div id='wowcanvasimages' class="scroll-content">
    
    	</div>
		<div class="scroll-bar-wrap ui-widget-content ui-corner-bottom">
			<div class="scroll-bar" style='display:none;'></div>
		</div>
    </div>
    <?php
    	if ( isset( $_REQUEST[ 'file' ] ) ) { 
    		check_admin_referer( "wowmoodboard" );
 			echo absint( $_REQUEST[ 'file' ] );
		}
	?>
    </div>
<?php endif ?>           
	<div id='wowcanvas' class='<?php echo $canvasclass; ?>'>
    	<div id='loading'><img src='<?php echo plugins_url( '/assets/images/ajax-loader.gif', dirname(__FILE__) ); ?>' alt='Loading Moodboard' /></div>
    </div>
   
</div>
<script type='text/javascript'>
var apiKey       = '<?php echo $this->YoutubeAPI; ?>';
var YTmaxResults = '<?php echo $this->YoutubeMaxResuls; ?>';
var wowproxyurl  = '<?php echo plugins_url( "wowproxy.php", dirname(__FILE__) ); ?>' + '?url=';
<!--
document.addEventListener("DOMContentLoaded", function(event) 
{
	<?php if ( isset( $edit ) && $edit ) : ?>
	loadEditMode();
	<?php endif ?>   
	
	initMoodboard( <?php echo json_encode( wp_create_nonce( 'wowcanvas-security'.$postid ) ); ?>, <?php echo json_encode( $postid ); ?> );	
	
	<?php if ( isset( $edit ) && $edit ) : ?>	
	CreateScrollbar();
	<?php endif ?>   

});
//--></script>