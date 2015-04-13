<?php
/*
Part of Name: WoW Moodboard Lite
Plugin URI: https://wownmedia.com/wow-moodboard/
Description: Create the admin environment for the Wow Moodboard plugin.
Version: 1.1.1 [ 2015.04.13 ]
Author: Wow New Media
Author URI: https://wownmedia.com
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

class WowMoodboardOptions
{
	// Our options
	private $options;


	// Init Options
	public function __construct()
    {
		// Attach our Admin Menu
		add_action( 'admin_menu', array( $this, 'add_plugin_page' ) );
        add_action( 'admin_init', array( $this, 'page_init' ) );

		// Check if we need to update
		add_action( 'admin_notices', 'wow_moodboard_update' );
    }
	
	// Add options page
	public function add_plugin_page()
    {
        // This page will be under "Settings"
        add_options_page(
            __( 'WoW MoodBoard Settings', 'wow_moodboard' ), 
            'Wow Moodboard Lite', 
            'manage_options', 
            'wow_moodboard', 
            array( $this, 'create_admin_page' )
        );
    }
	
	
	// Create the options page
	public function create_admin_page()
    {
        // Set class property
		$this->read_Options();
        ?>
        <div class="wrap">
            <h2><?php _e( 'Wow Moodboard Lite Plugin Settings ', 'wow_moodboard' ); ?></h2>           
            <form method="post" action="options.php" name="formwowmoodboard">
            <?php
                // This prints out all hidden setting fields
                settings_fields( 'wowmoodboard_option_group' );   
                $this->do_settings_sections( 'wowmoodboard-setting-admin' );
                submit_button(); 
            ?>
            </form>
            <hr />
    		
            <h2>Wow Moodboard Pro</h2>
            <a href="https://wownmedia.com/wow-moodboard/" title="Wow Moodboard Pro">
            	<img src='<?php echo plugins_url( '/assets/images/wowmoodboardpro.jpg', __FILE__ ) ?>' 
                	 alt='Wow Moodboard Pro' width='800' height='407'>
			</a>
            <h3>
				<?php _e('Upgrade now to '); ?><a href="https://wownmedia.com/wow-moodboard/" title="Wow Moodboard Pro">Wow Moodboard Pro</a>
            	<?php _e('to get additional options:'); ?>
            </h3>
            <ul>
            	<li>* <?php _e("Customize the look of your mood boards with a <strong>custom background</strong>", 'wow_moodboard') ?></li>
            	<li>* <?php _e("Resize your mood boards to <strong>fit your needs</strong>", 'wow_moodboard') ?></li>
            	<li>* <?php _e("<strong>Auto-Scale</strong> your mood boards to different screen sizes", 'wow_moodboard') ?></li>
            	<li>* <?php _e("Add music to your mood boards with <strong>Spotify Album search</strong>", 'wow_moodboard') ?></li>
            	<li>* <?php _e("Allow your audience to view YouTube videos from your mood boards <strong>fullscreen</strong>", 'wow_moodboard') ?></li>
            	<li>* <?php _e("Receive <strong>more search results to choose from</strong> when performing Google Image and Youtube searches", 'wow_moodboard') ?></li>
            	<li>* <?php _e("Add <strong>Clickable links</strong> to images placed on the Moodboard", 'wow_moodboard') ?></li>
            </ul>
            <hr />
		</div>
        <?php
    }
	
	
	// Register Settings
	public function page_init()
    {        
	
		// Register Settings
        register_setting(
            'wowmoodboard_option_group',	// Option group
            'wow_youtube_api', 				// Option name
            'sanitize_text_field' 			// Sanitize
        ); 
		
		register_setting(
            'wowmoodboard_option_group', 		// Option group
            'wow_youtube_active', 				// Option name
            array( $this, 'sanitizeBoolean' ) 	// Sanitize
        );

		register_setting(
            'wowmoodboard_option_group', 		// Option group
            'wow_google_active', 				// Option name
            array( $this, 'sanitizeBoolean' ) 	// Sanitize
        );

		register_setting(
            'wowmoodboard_option_group', 		// Option group
            'wow_upload_active', 				// Option name
            array( $this, 'sanitizeBoolean' ) 	// Sanitize
        );

		// Create Menu Sections
		add_settings_section(
            'setting_general_id', 								// ID
            __( 'General Moodboard Settings', 'wow_moodboard' ),// Title
            array( $this, 'print_generalsection_info' ), 		// Callback
            'wowmoodboard-setting-admin' 						// Page
        );  
		
        add_settings_section(
            'setting_google_id', 									// ID
            __( 'Google Image Search Settings', 'wow_moodboard' ),	// Title
            array( $this, 'print_googlesection_info' ), 			// Callback
            'wowmoodboard-setting-admin' 							// Page
        );  
		
		add_settings_section(
            'setting_youtube_id', 									// ID
            __( 'YouTube Video Search Settings', 'wow_moodboard' ),	// Title
            array( $this, 'print_ytsection_info' ), 				// Callback
            'wowmoodboard-setting-admin' 							// Page
        );  

		add_settings_section(
            'setting_spotify_id', 									// ID
            __( 'Spotify Album Search Settings', 'wow_moodboard' ),	// Title
            array( $this, 'print_spotifysection_info' ), 			// Callback
            'wowmoodboard-setting-admin' 							// Page
        );  

        add_settings_section(
            'setting_upload_id', 									// ID
            __( 'Image Upload Settings', 'wow_moodboard' ),			// Title
            array( $this, 'print_uploadsection_info' ), 			// Callback
            'wowmoodboard-setting-admin' 							// Page
        );  

		add_settings_section(
            'setting_wowproxy_id', 									// ID
            __( 'Wow Proxy Settings', 'wow_moodboard' ),			// Title
            array( $this, 'print_proxysection_info' ), 				// Callback
            'wowmoodboard-setting-admin' 							// Page
        );  


		// Create Section Fields
        add_settings_field(
            'wow_autoscale', 										// ID
            __( 'Enable Autoscale Moodboard Width', 'wow_moodboard' ),// Title 
            array( $this, 'general_autoscale_callback' ), 			// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_general_id', 									// Section      
			array( 'label_for' => 'wow_autoscale' )   				// Set <label>  
        );
		
		add_settings_field(
            'wow_resize', 											// ID
            __( 'Enable Resizeable Moodboard Height', 'wow_moodboard' ),// Title 
            array( $this, 'general_resize_callback' ), 				// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_general_id', 									// Section      
			array( 'label_for' => 'wow_resize' )   					// Set <label>  
        );    
		
		add_settings_field(
            'wow_background', 										// ID
            __( 'Enable Custom Backgrounds', 'wow_moodboard' ),		// Title 
            array( $this, 'general_background_callback' ), 			// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_general_id', 									// Section      
			array( 'label_for' => 'wow_background' )   				// Set <label>  
        );
		
		add_settings_field(
            'wow_google_activated', 								// ID
            __( 'Enable Google Image Search', 'wow_moodboard' ),	// Title 
            array( $this, 'ggl_activated_callback' ), 				// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_google_id', 									// Section      
			array( 'label_for' => 'wow_google_activated' )			// Set <label>  
        );
		
		add_settings_field(
            'wow_google_url', 										// ID
            __( 'Enable Clickable Links on Images', 'wow_moodboard' ),// Title 
            array( $this, 'ggl_clickable_callback' ), 				// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_google_id', 									// Section      
			array( 'label_for' => 'wow_google_url' )				// Set <label>  
        );
		
		add_settings_field(
            'wow_youtube_activated', 								// ID
            __( 'Enable YouTube Search', 'wow_moodboard' ),			// Title 
            array( $this, 'yt_activated_callback' ), 				// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_youtube_id', 									// Section      
			array( 'label_for' => 'wow_youtube_activated' )			// Set <label>  
        );    
		
		add_settings_field(
            'wow_youtube_api', 										// ID
            __( 'YouTube API Key', 'wow_moodboard' ),				// Title 
            array( $this, 'yt_api_callback' ), 						// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_youtube_id', 									// Section      
			array( 'label_for' => 'wow_youtube_api' )   			// Set <label>  
        );      

		add_settings_field(
            'wow_youtube_fullscreen', 								// ID
            __( 'Allow Fullscreen playback', 'wow_moodboard' ),		// Title 
            array( $this, 'yt_fullscreen_callback' ), 				// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_youtube_id', 									// Section      
			array( 'label_for' => 'wow_youtube_fullscreen' )		// Set <label>  
        );      

		add_settings_field(
            'wow_spotify_activated', 								// ID
            __( 'Enable Spotify Album Search', 'wow_moodboard' ),	// Title 
            array( $this, 'spotify_activated_callback' ), 			// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_spotify_id', 									// Section      
			array( 'label_for' => 'wow_spotify_activated' )			// Set <label>  
        );
		
		add_settings_field(
            'wow_upload_activated', 								// ID
            __( 'Enable Image Upload', 'wow_moodboard' ),			// Title 
            array( $this, 'upload_activated_callback' ), 			// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_upload_id', 									// Section      
			array( 'label_for' => 'wow_upload_activated' )			// Set <label>  
        );
		
		add_settings_field(
            'wow_upload_url', 										// ID
            __( 'Enable Clickable Links on Images', 'wow_moodboard' ),// Title 
            array( $this, 'upload_clickable_callback' ),			// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_upload_id', 									// Section      
			array( 'label_for' => 'wow_upload_url' )				// Set <label>  
        );
		
		add_settings_field(
            'wow_proxy_activated', 									// ID
            __( 'Enable Image Proxy', 'wow_moodboard' ),			// Title 
            array( $this, 'wowproxy_activated_callback' ), 			// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_wowproxy_id', 									// Section      
			array( 'label_for' => 'wow_proxy_activated' )			// Set <label>  
        );
		
		add_settings_field(
            'wow_caching_activated', 								// ID
            __( 'Enable Moodboard HTML caching', 'wow_moodboard' ),	// Title 
            array( $this, 'wowcaching_activated_callback' ), 		// Callback
            'wowmoodboard-setting-admin', 							// Page
            'setting_wowproxy_id', 									// Section      
			array( 'label_for' => 'wow_caching_activated' )			// Set <label>  
        );
		
		// BuddyPress
			add_settings_section(
            	'setting_buddypress_id', 								// ID
	            __( 'Buddypress Settings', 'wow_moodboard' ),			// Title
    	        array( $this, 'print_buddypresssection_info' ), 		// Callback
        	    'wowmoodboard-setting-admin' 							// Page
       		);  

			add_settings_field(
    	        'wow_buddypress', 										// ID
        	    __( 'Enable Moodboard on Buddypress profiles', 'wow_moodboard' ),// Title 
            	array( $this, 'wow_buddypress_activated' ),			// Callback
    	        'wowmoodboard-setting-admin', 							// Page
        	    'setting_buddypress_id', 								// Section      
				array( 'label_for' => 'wow_buddypress' )				// Set <label>  
       		);

    }
	
	
	// Callback Functions
	// General Section info
	public function print_generalsection_info()
	{
		_e( "Configure your Moodboards` Look and Feel", 'wow_moodboard' );	
	}
	
	// Google Image Search Section
	public function print_googlesection_info()
	{
		_e( "Configure Google Image Search", 'wow_moodboard' );	
	}
	
	
	// Spotify Album Search
	public function print_spotifysection_info()
	{
		_e( "Configure Spotify Album Search", 'wow_moodboard' );
	}
	
	// Image Upload
	public function print_uploadsection_info()
	{
		_e( "Configure Image Upload", 'wow_moodboard' );
	}
	
	// Wow Proxy Section
	public function print_proxysection_info()
	{
		_e( "Configure Wow Proxy", 'wow_moodboard' );
	}
	
	// YouTube Section Info
	public function print_ytsection_info()
    {
		_e( "Configure YouTube Video Search", 'wow_moodboard' );	
		?>
        <br><em>( <?php _e("The API Key is obtained from the Google Developers Console at", 'wow_moodboard'); ?> 
        <a href="https://console.developers.google.com/" target="_blank">https://console.developers.google.com/</a> )</em>
        <?php
    }
	
	// Wow Proxy Section
	public function print_buddypresssection_info()
	{
		_e( "Enable Moodboards on BuddyPress profiles", 'wow_moodboard' );
	}
	
	// General Settings
	// Autoscale
	public function general_autoscale_callback()
	{
		_e( "Allow MoodBoards to scale to fit Screen Width", 'wow_moodboard' );	
		?><br><?php
		$this->upgradetopro_callback();	
	}
	
	// Resize
	public function general_resize_callback()
	{
		_e( "Allow MoodBoards` Height to be resized", 'wow_moodboard' );	
		?><br><?php
		$this->upgradetopro_callback();	
	}
	
	// Background
	public function general_background_callback()
	{
		_e( "Configure Custom Backgrounds for your MoodBoards", 'wow_moodboard' );	
		?><br><?php
		$this->upgradetopro_callback();	
	}
	
	
	// Google Settings
	// Google Activated
	public function ggl_activated_callback()
	{
		$enabled  = !isset( $this->options['wow_google_active'] ) || $this->options['wow_google_active'] == true  ? "checked" : "";
		$disabled = $enabled == "" ? "checked" : "";
		?> 
		<input type="radio" name="wow_google_active" value="1" <?php echo $enabled; ?>  ><?php _e("Enable Google Image Search"); ?> &nbsp;&nbsp;
		<input type="radio" name="wow_google_active" value="0" <?php echo $disabled; ?> ><?php _e("Disable Google Image Search");
	}
	
	// Links
	public function ggl_clickable_callback()
	{
		_e( "Enable Links to your Google Images so they become Clickable", 'wow_moodboard' );	
		?><br><?php
		$this->upgradetopro_callback();	
	}

	// YouTube Settings
	// YouTube Activated
	public function yt_activated_callback()
	{
		$enabled  = !isset( $this->options['wow_youtube_active'] ) || $this->options['wow_youtube_active'] == true  ? "checked" : "";
		$disabled = $enabled == "" ? "checked" : "";
		?>
		<input type="radio" name="wow_youtube_active" value="1" <?php echo $enabled; ?>  >
		<?php _e("Enable YouTube Search", 'wow_moodboard'); ?> &nbsp;&nbsp;
		<input type="radio" name="wow_youtube_active" value="0" <?php echo $disabled; ?> >
		<?php _e("Disable YouTube Search", 'wow_moodboard');
	}

	// YouTube API Key
	public function yt_api_callback()
    {
        printf(
            '<input type="text" id="wow_youtube_api" name="wow_youtube_api" value="%s" size="45" />',
            isset( $this->options['wow_youtube_api'] ) ? esc_attr( $this->options['wow_youtube_api']) : ''
        );
    }
	
	// YouTube Fullscreen
	public function yt_fullscreen_callback()
	{
		$this->upgradetopro_callback();	
	}
	
	
	// Spotify Settings
	// Activated
	public function spotify_activated_callback()
	{
		_e( "Add music from Spotify to your Moodboards", 'wow_moodboard' );	
		?><br><?php
		$this->upgradetopro_callback();	
	}


	// Upload Settings
	// Upload Activated
	public function upload_activated_callback()
	{
		$enabled  = !isset( $this->options['wow_upload_active'] ) || $this->options['wow_upload_active'] == true  ? "checked" : "";
		$disabled = $enabled == "" ? "checked" : "";
		?> 
		<input type="radio" name="wow_upload_active" value="1" <?php echo $enabled; ?>  ><?php _e("Enable Image Upload"); ?> &nbsp;&nbsp;
		<input type="radio" name="wow_upload_active" value="0" <?php echo $disabled; ?> ><?php _e("Disable Image Upload");
	}
	
	// Links
	public function upload_clickable_callback()
	{
		_e( "Enable Links to your Uploaded Images so they become Clickable", 'wow_moodboard' );	
		?><br><?php
		$this->upgradetopro_callback();	
	}
	
	
	// Wow Proxy Settings 
	// Activated
	public function wowproxy_activated_callback()
	{
		_e( "Enable Image Proxy to allow local caching and prevent HTTPS warnings", 'wow_moodboard' );	
		?><br><?php
		$this->upgradetopro_callback();	
	}
	
	// Moodboard Caching
	public function wowcaching_activated_callback()
	{
		_e( "Enable Moodboard HTML caching to speed up pageload", 'wow_moodboard' );	
		?><br><?php
		$this->upgradetopro_callback();	
	}
	
	// Add BuddyPress Profile
	public function wow_buddypress_activated()
	{
		_e( "Enable Moodboards on BuddyPress profiles", 'wow_moodboard' );	
		?><br><?php
		$this->upgradetopro_callback();	
	}
	
	
	// Upgrade to Pro
	public function upgradetopro_callback()
    {
		?>
        <em><a href="https://wownmedia.com/wow-moodboard/" title="Wow Moodboard Pro">
        <?php
		_e( "Upgrade to Wow Moodboard Pro to enable this feature.", 'wow_moodboard');
		?>
        </a></em>
        <?php
    }


	// Sanitize True/False values
    public function sanitizeBoolean( $input )
    {
		return $input == "1" ? "1" : "0";	
    }
	
	// Fill the options
	protected function read_Options()
	{
        $this->options['wow_youtube_api'] 		= get_option( 'wow_youtube_api' );
		$this->options['wow_youtube_active'] 	= get_option( 'wow_youtube_active', true );
		$this->options['wow_google_active'] 	= get_option( 'wow_google_active', true );
		$this->options['wow_upload_active'] 	= get_option( 'wow_upload_active', true );
	}

	// Create sections with a divider line
	protected function do_settings_sections( $page ) 
	{
		global $wp_settings_sections, $wp_settings_fields;
	
		if ( ! isset( $wp_settings_sections[$page] ) )
			return;
	
		foreach ( (array) $wp_settings_sections[$page] as $section ) 
		{
			if ( $section['title'] )
	    		echo "<hr><h3>{$section['title']}</h3>\n";
	
			if ( $section['callback'] )
		    	call_user_func( $section['callback'], $section );
	
	    	if ( ! isset( $wp_settings_fields ) || !isset( $wp_settings_fields[$page] ) || !isset( $wp_settings_fields[$page][$section['id']] ) )
	    		continue;
	    	echo '<table class="form-table">';
	    	do_settings_fields( $page, $section['id'] );
	    	echo '</table>';
		}
	}

}


// Handle updating to a new version
function wow_moodboard_update()
{
	if ( !current_user_can( 'manage_options' ) ) return false;
	
	// Check if we need to update
	$storedversion = get_option( "wowmoodboardversion" );
	if ( $storedversion != false)
	{ 
		if ( $storedversion != WOWMOODBOARD )
		{
			// Upgrade the Moodboards
			if ( WoW_MoodBoard::UpgradeMoodboards( $storedversion ) ) 
			{
				update_option( "wowmoodboardversion", WOWMOODBOARD );
				
				?>
    			<div class="updated">
        			<p>Wow Moodboard: <?php _e( 'Your Moodboards have been updated', 'wow_moodboard' ); ?></p>
    			</div>
    			<?php 	
			}
		}
	}
	else update_option( "wowmoodboardversion", WOWMOODBOARD );	
}

if( is_admin() )
{
    $my_settings_page = new WowMoodboardOptions();
}