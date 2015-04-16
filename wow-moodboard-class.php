<?php
/*
Part of Name: WoW Moodboard Lite / Pro
Plugin URI: http://wownmedia.com/wow-moodboard/
Description: The core class for the Wow Moodboard Lite and Pro plugin.
Version: 1.1.1.1[ 2015.04.16 ]
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

if( !class_exists( 'WoW_MoodBoard' ) ) 
{

class WoW_MoodBoard 
{
	// Define API and customization vars
	protected $YoutubeAPI       = false; 
	protected $YouTubeActive	= true;
	protected $YoutubeMaxResuls = 10; 
	protected $GoogleMaxResuls  = 1; 
	protected $GoogleActive		= true;
	protected $UploadActive		= true;
	
	function __construct() 
	{
		add_action( 'init', array( $this, 'mb_init' ) );
		add_action( 'wp_head', array( $this, 'pluginname_ajaxurl' ) );	

		// AJAX endpoint functions
		add_action( 'wp_ajax_pushcanvas', array( $this, 'pushcanvas' ) );
		add_action( 'wp_ajax_nopriv_pushcanvas', array( $this, 'pushcanvas' ) );
		add_action( 'wp_ajax_savecanvas', array( $this, 'savecanvas' ) ); 
	}
	
	
	// Create a shortcode to add a moodboard to a page or post
	public function mb_init() 
	{
		// Create the shortcode
		add_shortcode( 'moodboard', array( $this, 'create_moodboard' ) );
		
		// Read options from Database
		$this->YoutubeAPI 	= get_option( "wow_youtube_api" );
		$this->YouTubeActive= get_option( "wow_youtube_active", true );
		$this->GoogleActive	= get_option( "wow_google_active", true );
		$this->UploadActive	= get_option( "wow_upload_active", true );
	}
	
	
	// Create a Moodboard
	public function create_moodboard( $atts ) 
	{	
		// Check if we are on a location where more than 1 Moodboard could be shown
		if ( is_singular() )
		{		
			// Check if a user has edit/admin rights for this post/page
			$postid = get_the_ID();
			$edit   = WoW_MoodBoard::checkMoodboardEdit( $postid );				
		
			// Load all the needed scripts and styles
			$this->LoadScripts( $edit );
			$this->LoadCss( $edit );
					
			// Create the Moodboard HTML
			ob_start();
			require( dirname( __FILE__ ) . '/templates/moodboard.php' );
			return ob_get_clean();
		}
		else
		{
		 	ob_start();
			?>
			<h3 class='moodboardmessage'>
            	[ Moodboard:&nbsp;
            	<a href="<?php echo get_permalink( get_the_ID() ); ?>" title="<?php the_title(); ?>">
            	<?php echo translate( 'Please visit the complete article to see the Moodboard' ); ?>
                </a> ]
            </h3>	
			<?php 	
			return ob_get_clean();
		}
	} 
	
	
	// Enqueue CSS Stylesheets
	protected function LoadCss( $edit )
	{
		wp_enqueue_style( 	'wowmoodboard-styles', 
							plugins_url( 'assets/css/wowmoodboard.css', __FILE__ ), 
							array(), 
							'1.1.1' 
		);
		
		wp_enqueue_style( 	'font-awesome', 
							plugins_url( 'assets/css/font-awesome.min.css', __FILE__ ), 
							array(), 
							'4.3.0' 
		);
		
		if ( $edit ) 
		{
			// This can conflict with other plugins because WordPress core does not have a full jQuery UI theme!
			wp_enqueue_style( 	'wowjquery-ui', 
								plugins_url( 'assets/css/jquery-ui.css', __FILE__ ), 
								array(),
								'1.11.2'
			);	
		}
	}
	
	
	// Enqueue Javascript
	protected function LoadScripts( $edit )
	{
		// General scripts to be used
		wp_enqueue_script( 'jquery' );
		wp_enqueue_script( 'jquery-ui-core' );
		wp_enqueue_script( 'jquery-ui-widget' );
		wp_enqueue_script( 'jquery-ui-slider' );
		wp_enqueue_script( 'jquery-ui-progressbar' );
		wp_enqueue_script( 'jquery-ui-tabs' );
		wp_enqueue_script( 'jquery-ui-draggable' );
		wp_enqueue_script( 'jquery-ui-droppable' );
		wp_enqueue_script( 'jquery-ui-resizable' );
		wp_enqueue_script( 'jquery-ui-button' );

		wp_enqueue_script( 	'wowmoodboard-head',
							plugins_url( 'assets/js/wow-moodboard-head.js', __FILE__ ), 
							array( 	'jquery', 
							 		'jquery-ui-core', 
									'jquery-ui-widget',
									'jquery-ui-draggable', 
									'jquery-ui-slider', 
									'jquery-ui-droppable', 
									'jquery-ui-resizable', 
									'jquery-ui-tabs', 
									'jquery-ui-button',
									'jquery-ui-progressbar'  
							), 
							'1.1.1' 
		);

		wp_enqueue_script( 'wowmoodboard', 
							plugins_url( 'assets/js/wow-moodboard.js', __FILE__ ), 
							array( 	'jquery', 
							 		'jquery-ui-core', 
									'jquery-ui-widget',
									'jquery-ui-draggable', 
									'jquery-ui-slider', 
									'jquery-ui-droppable', 
									'jquery-ui-resizable', 
									'jquery-ui-tabs', 
									'jquery-ui-button',
									'jquery-ui-progressbar'  
							), 
							'1.1.1', 
							true 
		);		
		
		wp_enqueue_script( 	'wowmoodboard-lite', 
							plugins_url( 'assets/js/wow-moodboard-lite.js', __FILE__ ), 
							array( 	'wowmoodboard', 
							), 
							'1.1.1', 
							true 
		);
		
		if ( $edit ) 
		{
			// Scripts to be used when editting a Moodboard
			wp_enqueue_script( 'plupload' );
			wp_enqueue_script( 'plupload-html4' );
			wp_enqueue_script( 'plupload-html5' );

			wp_enqueue_script( 	'googleapi', 
								'https://apis.google.com/js/client.js?onload=googleApiClientReady', 
								'1', 
								true 
			);	

			wp_enqueue_script( 	'googlejsapi', 
								'https://www.google.com/jsapi'
			);

			wp_enqueue_script( 	'wowjsapi', 
								plugins_url( 'assets/js/wow-search.js', __FILE__ ), 
								array( 	'googlejsapi', 
										'jquery-ui-core' 
								), 
								'1.1.1' 
			);

			wp_enqueue_script( 	'wowwpmedia', 
								plugins_url( 'assets/js/wow-wpmedia.js', __FILE__ ), 
								array( 	'wowmoodboard', 
								), 
								'1.1.1.1', 
								true 
			);
		}
	}
	
	
	/* Is the current user allowed to edit this Moodboard?
 	 * A Moodboard can be edited when:
	 * - The User has Admin rights;
	 * - The User has edit-rights to the current page/post;
	 * - The User is viewing his own BuddyPress profile
	 */	
	public static function checkMoodboardEdit( $postid )
	{
		return WoW_MoodBoard::checkBuddyPressId() || WoW_MoodBoard::checkSaveAllowed( $postid );
	}
	
	
	// Push the current moodboard to the screen, AJAX
	public static function pushcanvas() 
	{
		global $wowmoodboard;
	
    	// Check if this request comes from us
		$postid = isset( $_POST['postid'] ) ? $_POST['postid'] : 0;
		check_ajax_referer( 'wowcanvas-security'.$postid, 'security' );

		// Check if we show a BuddyPress profile or Page/Post
		if ( class_exists( 'BuddyPress' ) && bp_is_member() ) 
		{
			// We are looking at a BuddyPress profile
			$userId		= bp_displayed_user_id();
			$content    = get_user_meta( $userId, "moodboard", true);
			$dimentions = get_user_meta( $userId, "wowdimentions", true);
			$background = get_user_meta( $userId, "wowbackground", true);
		}
		elseif ( get_post_status( $_POST['postid']) == "publish" || WoW_MoodBoard::checkMoodboardEdit( $postid ) ) 
		{
			$content    = get_post_meta( $_POST['postid'], "moodboard", true);
			$dimentions = get_post_meta( $_POST['postid'], "wowdimentions", true);
			$background = get_post_meta( $_POST['postid'], "wowbackground", true);
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
		$moodboardcontent[ "edit" ] 		= WoW_MoodBoard::checkMoodboardEdit( $postid ); 
		$moodboardcontent[ 'header' ] 		= $moodboardcontent["edit"] ? translate('How do I start?') : false;
		$moodboardcontent[ 'instructions' ]	= $moodboardcontent["edit"] ? translate('Place several objects of your interests here.<ol><li>Enter your Search (for instance a Youtube video) or Upload a photo directly from your computer.</li><li>Drag the object from the grey bar to this Moodboard.</li></ol>') : false;
		$moodboardcontent[ "content" ] 		= isset( $content )               ? $content               : false;
		$moodboardcontent[ "width" ]		= isset( $dimentions['width'] )   ? $dimentions['width']   : false;
		$moodboardcontent[ "height" ]		= isset( $dimentions['height'] )  ? $dimentions['height']  : false;
		$moodboardcontent['bgimage']		= get_option( "wow_background_active" ) && isset( $background['image'] )   
																			  ? $background['image']   : "none";
		$moodboardcontent['bgcontain']		= isset( $background['contain'] ) ? $background['contain'] : "inherit";
		$moodboardcontent['bgrepeat']		= isset( $background['repeat'] )  ? $background['repeat']  : "round";
	
		// Push the moodboard
		echo json_encode($moodboardcontent); 

	    die(); // this is required to return a proper result
	}


	public static function pluginname_ajaxurl() 
	{
		?>
		<script type="text/javascript">
			var ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';
		</script>
    	<?php
	}


	// Save the current moodboard, AJAX
	public static function savecanvas() 
	{
		// Check if this request comes from us
		check_ajax_referer( 'wowcanvas-security'.$_POST['postid'], 'security' );
	
		// Prepare the Response
		$response = array();
	
		// Check if the current logged in user can save this MoodBoard
		if ( ! WoW_MoodBoard::checkMoodboardEdit( $_POST['postid'] ) ) {
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
											"href"		=> sanitize_text_field( $object["href"] ),
											"sanitized" => true );
				$canvas[] = $sanitizedobject;	
			}
	
			// Store Canvas dimentions
			$dimentions = array();
			$dimentions['width']  = isset( $_POST['width'] ) ? $_POST['width'] : 0;
			$dimentions['height'] = isset( $_POST['height'] ) ? $_POST['height'] : 0;
			
			// Store Background
			$background = array();
			$background['image']   = isset( $_POST['bgimage'] ) ? $_POST['bgimage'] : "none";
			$background['contain'] = isset( $_POST['bgcontain'] ) ? $_POST['bgcontain'] : "inherit";
			$background['repeat']  = isset( $_POST['bgrepeat'] ) ? $_POST['bgrepeat'] : "round";
	
			// Save to Database, either BuddyPress or Post/Page
			if ( WoW_MoodBoard::checkBuddyPressId() )
			{
				// We are editing a BuddyPress profile (and allowed to do so)
				$userId = bp_displayed_user_id();	
				if (!empty( $canvas ) )
				{
					$response['canvas'] = update_user_meta( $userId, "moodboard", $canvas );	
				}

				$response['dimentions'] = update_user_meta( $userId, "wowdimentions", $dimentions );
				if ( get_option( "wow_background_active" ) )
				{
					$response['background'] = update_user_meta( $userId, "wowbackground", $background );
				}
			
				if ( get_option("wow_cache_canvas", true ) )
				{
					$response['cached'] = update_user_meta( $userId, "wow_cached_canvas", $_POST['moodboard'] );
				}
			
				$response['success'] = true;
			}
			elseif ( WoW_MoodBoard::checkSaveAllowed( $_POST['postid'] ) )
			{
				// We are editing a Post/Page (and allowed to do so)	
				if (!empty( $canvas ) )
				{
					$response['canvas'] = update_post_meta( $_POST['postid'], "moodboard", $canvas );	
				}


				$response['dimentions'] = update_post_meta( $_POST['postid'], "wowdimentions", $dimentions );
				if ( get_option( "wow_background_active" ) )
				{
					$response['background'] = update_post_meta( $_POST['postid'], "wowbackground", $background );
				}
			
				if ( get_option("wow_cache_canvas", true ) )
				{
					$response['cached'] = update_post_meta( $_POST['postid'], "wow_cached_canvas", $_POST['moodboard'] );
				}
			
				$response['success'] = true;
			}
		}
 
 		else 
		{
			//Empty Moodboard
			$response['success'] = "empty";
			delete_post_meta( $_POST['postid'], "moodboard" );
		}
		
    	// response output
	    echo json_encode($response);
    	die();
	}
	
	// Check if we are on a BuddyPress profile page and if we are allowed to update the moodmoard
	public static function checkBuddyPressId()
	{
		if ( class_exists( 'BuddyPress' ) ) 
		{
			return bp_is_member() && bp_user_has_access();
		}
		else return false;
	}
	
	// Check if we are allowed to save a Moodboard
	public static function checkSaveAllowed( $postid )
	{
		return current_user_can('edit_post', $postid );	
	}
		
	
	// Upgrade a MoodBoard to the latest version
	public static function upgradeMoodBoards( $storedversion )
	{
		$success = WoW_MoodBoard::UpdateAllMoodBoards( WOWMOODBOARD );
		return $success;	
	}
	
	
	// Update All Moodboards
	public static function UpdateAllMoodBoards( $version )
	{
		// Get all posts that have a Moodboard stored
		$moodboardschanged = 0;
		$moodboards = WoW_MoodBoard::GetMoodboardsDB();
				
		foreach( $moodboards as $postId) 
		{
			switch ( $version ) 
			{
				case "1.0.4":
					// Read the MoodBoard dimentions from the Post options
					$dimentions = get_post_meta( $postId, "dimentions", true );

					// Write the updated dimentions to the post
					if ( !empty( $dimentions ) )
					{
						update_post_meta( $postId, "wowdimentions", $updateMoodboards );
						$moodboardschanged++;
					}
					break;
				
				default:
			}
			
		}
		
		return $moodboardschanged;
	}
	
	// Get all Moodboards from the DB
	public static function GetMoodboardsDB()
	{
		global $wpdb;
		
		$meta_key   = 'moodboard';
		$moodboards = $wpdb->get_col( 
						$wpdb->prepare( 
										"
											SELECT post_id 
											FROM $wpdb->postmeta 
											WHERE meta_key = %s
										", 
										$meta_key
						)
		);
		
		return $moodboards;
	}
	
} // Closing Class WoW_MoodBoard
} // Closing if !class_exists