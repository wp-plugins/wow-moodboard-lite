<?php
/*
Part of Name: WoW Moodboard Lite / Pro
Plugin URI: http://wownmedia.com/wow-moodboard/
Description: Functions for the Wow Moodboard plugin.
Version: 2014.12.09
Author: Wow New Media
Author URI: http://wownmedia.com
License: GPLv2 or later

	WoW Moodboard, plugin for Wordpress.
	Copyright © 2014 Wow New Media

	Wow New Media
	info@wownmedia.com
	Buzon 621 Sta. Clara
	03599 Altea la Vella
	ALC Spain
	
*/
defined( 'WOWMOODBOARD' ) or die( 'No direct access to this file allowed.' );


// Push the current moodboard to the screen, AJAX
function pushcanvas() 
{
	global $wowmoodboard;
	
    // Check if this request comes from us
	check_ajax_referer( 'wowcanvas-security'.$_POST['postid'], 'security' );

	if ( get_post_status( $_POST['postid']) == "publish" || (current_user_can( 'edit_post', $_POST['postid'] ) ) ) 
	{
		$content =    get_post_meta( $_POST['postid'], "moodboard", true);
		$dimentions = get_post_meta( $_POST['postid'], "dimentions", true);
	}	
	else
	{
		// This Moodboard should not be shown
		$content 			  = false;
		$dimentions['width']  = false;
		$dimentions['height'] = false;
	}
	
    // generate the response
	$moodboardcontent = array();
	$moodboardcontent["edit"] 			= WoW_MoodBoard::checkMoodboardEdit( $_POST['postid'] );
	$moodboardcontent['header'] 		= $moodboardcontent["edit"] ? translate('How do I start?') : false;
	$moodboardcontent['instructions'] 	= $moodboardcontent["edit"] ? translate('Place several objects of your interests here.<ol><li>Enter your Search (for instance a Youtube video) or Upload a photo directly from your computer.</li><li>Drag the object from the grey bar to this Moodboard.</li></ol>') : false;
	$moodboardcontent["content"] 		= isset( $content ) ? $content : false;
	$moodboardcontent["width"]			= isset( $dimentions['width'] ) ? $dimentions['width'] : false;
	$moodboardcontent["height"]			= isset( $dimentions['height'] ) ? $dimentions['height'] : false;
	
	// Push the moodboard
	echo json_encode($moodboardcontent); 
    die(); // this is required to return a proper result
}
add_action( 'wp_ajax_pushcanvas', 'pushcanvas' );
add_action( 'wp_ajax_nopriv_pushcanvas', 'pushcanvas' );

add_action('wp_head','pluginname_ajaxurl');
function pluginname_ajaxurl() 
{
	?>
	<script type="text/javascript">
		var ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';
	</script>
    <?php
}


// Save the current moodboard, AJAX
function savecanvas() 
{
	// Check if this request comes from us
	check_ajax_referer( 'wowcanvas-security'.$_POST['postid'], 'security' );
	
	// Prepare the Response
	$response = array();
	
	// Check if the current logged in user can save this MoodBoard
	if ( ! current_user_can( 'edit_post', $_POST['postid'] ) ) {
		// response output
		$response['success'] = false;
    	echo json_encode($response);
    	die();
	}
		
	// Sanitize input
	if (isset ( $_POST['canvas'] ) && is_array( $_POST['canvas'] ) && !empty( $_POST['canvas'] ) )
	{
	    // Prepare the Moodboard
	    $canvas = array();

		foreach ( $_POST['canvas'] as $key => $object ) 
		{
			$sanitizedobject = array(	"id"		=> sanitize_title( $object["id"] ),
										"type"		=> sanitize_text_field( esc_html( $object["type"] ) ),
										"top"		=> absint( $object["top"] ),
										"left"		=> absint( $object["left"] ),
										"width"		=> absint( $object["width"] ),
										"height"	=> absint( $object["height"] ),
										"content"	=> sanitize_text_field( $object["content"] ),
										"caption"	=> sanitize_text_field( esc_html( $object["caption"] ) ),
										"zindex"	=> absint( $object["zindex"] ),
										"thumbnail" => sanitize_text_field( $object["thumbnail"] ),
										"sanitized" => true );
			$canvas[] = $sanitizedobject;	
		}
	
		// Store Canvas dimentions
		$dimentions = array();
		$dimentions['width']  = isset( $_POST['width'] ) ? $_POST['width'] : 0;
		$dimentions['height'] = isset( $_POST['height'] ) ? $_POST['height'] : 0;
	
		// Save to Database
		if ( current_user_can( 'edit_post', $_POST['postid'] ) ) 
		{
			// We are editting a moodboard in a Post; 
			$response['dimentions'] = update_post_meta( $_POST['postid'], "dimentions", $dimentions );
			$response['canvas']     = update_post_meta( $_POST['postid'], "moodboard", $canvas );	
		} 
		$response['success'] = true;
	}
 
    // response output
    echo json_encode($response);
    die();
}
add_action( 'wp_ajax_savecanvas', 'savecanvas' );