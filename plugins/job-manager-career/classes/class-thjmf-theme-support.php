<?php
/**
 * This file manages the theme support
 *
 * @link       https://themehigh.com
 * @since      1.3.0
 *
 * @package    job-manager-career
 * @subpackage job-manager-career/classes
 */
if(!defined('WPINC')){	die; }

if(!class_exists('THJMF_Theme_Support')):
 
class THJMF_Theme_Support {

	public static function init() {
		if( THJMF_ACTIVE_THEME === 'twentytwentyone' ){
			self::twentytwentyone_support();

		}else if( THJMF_ACTIVE_THEME === 'hestia' ){
			self::hestia_support();

		}else if( THJMF_ACTIVE_THEME === 'neve' ){
			self::neve_support();

		}else if( THJMF_ACTIVE_THEME === 'sydney' ){
			self::sydney_support();

		}else if( THJMF_ACTIVE_THEME === 'go' ){
			self::go_support();

		}else if( THJMF_ACTIVE_THEME === 'popularfx' ){
			self::popularfx_support();

		}else if( THJMF_ACTIVE_THEME === 'generatepress' ){
			self::generatepress_support();

		}else if( THJMF_ACTIVE_THEME === 'kadence' ){
			self::kadence_support();

		}else if( THJMF_ACTIVE_THEME === 'flatsome' ){
			self::flatsome_support();

		}else if( THJMF_ACTIVE_THEME === 'Divi' ){
			self::divi_support();

		}
	}

	public static function remove_before_after_contents(){
		remove_action('thjm_before_main_content', 'thjmf_single_job_before_content');
	    remove_action('thjm_after_main_content', 'thjmf_single_job_after_content');
	}

	public static function twentytwentyone_support(){
		self::remove_before_after_contents();
	}

	public static function hestia_support(){
		self::remove_before_after_contents();
	    add_action('thjm_before_main_content', array( __CLASS__, 'hestia_single_job_before_content'));
	    add_action('thjm_after_main_content', array( __CLASS__,  'hestia_single_job_after_content'));
	}

	public static function neve_support(){
		self::remove_before_after_contents();
	    add_action('thjm_before_main_content', array( __CLASS__, 'neve_single_job_before_content'));
	    add_action('thjm_after_main_content', array( __CLASS__,  'neve_single_job_after_content'));
	}

	public static function sydney_support(){
		self::remove_before_after_contents();
		add_action('thjm_before_main_content', array(__CLASS__, 'sydeny_single_job_before_content'));
		add_action('thjm_after_main_content', array( __CLASS__,  'sydeny_single_job_after_content'));
	}

	public static function go_support(){
		self::remove_before_after_contents();
		add_action('thjm_before_main_content', array(__CLASS__, 'go_single_job_before_content'));
		add_action('thjm_after_main_content', array( __CLASS__,  'go_single_job_after_content'));
	}

	public static function popularfx_support(){
		self::remove_before_after_contents();
		add_action('thjm_before_main_content', array(__CLASS__, 'popularfx_single_job_before_content'));
		add_action('thjm_after_main_content', array( __CLASS__,  'popularfx_single_job_after_content'));
	}

	public static function generatepress_support(){
		self::remove_before_after_contents();
		add_action('thjm_before_main_content', array(__CLASS__, 'generatepress_single_job_before_content'));
		add_action('thjm_after_main_content', array( __CLASS__,  'generatepress_single_job_after_content'));
	}

	public static function kadence_support(){
		self::remove_before_after_contents();
		add_action('thjm_before_main_content', array(__CLASS__, 'kadence_single_job_before_content'));
		add_action('thjm_after_main_content', array( __CLASS__,  'kadence_single_job_after_content'));
	}

	public static function flatsome_support(){
		self::remove_before_after_contents();
		add_action('thjm_before_main_content', array(__CLASS__, 'flatsome_single_job_before_content'));
		add_action('thjm_after_main_content', array( __CLASS__,  'flatsome_single_job_after_content'));
	}

	public static function divi_support(){
		self::remove_before_after_contents();
		add_action('thjm_before_main_content', array(__CLASS__, 'divi_single_job_before_content'));
		add_action('thjm_after_main_content', array( __CLASS__,  'divi_single_job_after_content'));
	}

	public static function hestia_single_job_before_content(){
    ?>
	    <div id="primary" class="content-area">
	        <main id="main" class="site-main" role="main">
	            <div id="primary" class="page-header boxed-layout-header header-small">
	                <div class="header-filter header-filter-gradient"></div>
	            </div>
	            <div class="main main-raised ">
	                <div class="blog-post blog-posts-wrapper">
	                    <div class="container">
	                        <article id="post-<?php echo esc_attr( get_the_ID() ); ?>" class="section section-text">
	                            <div class="row">
	                                <div class="col-md-8 single-post-container" data-layout="sidebar-right">
    <?php
	}

	public static function hestia_single_job_after_content(){
	    ?>
	                                </div>
	                                <?php get_sidebar(); ?>
	                            </div>
	                        </article>
	                    </div>
	                </div>
	            </div>
	        </main>
	    </div>
	    <?php
	}

	public static function neve_single_job_before_content(){
		?>
		<main id="content" class="neve-main" role="main">
			<div class="container single-post-container">
				<div class="row">
					<article id="post-<?php echo esc_attr( get_the_ID() ); ?>"
					class="<?php echo esc_attr( join( ' ', get_post_class( 'nv-single-post-wrap col' ) ) ); ?>">
		<?php
	}

	public static function neve_single_job_after_content(){
		?>
					</article>
					<?php do_action( 'neve_do_sidebar', 'single-post', 'right' ); ?>
				</div>
			</div>
		</main>
		<?php
	}

	public static function sydeny_single_job_before_content(){
		$sidebar_pos 	= sydney_sidebar_position();
		$width = get_theme_mod('fullwidth_single') ? 'fullwidth' : 'col-md-9';
		?>
		<div id="primary" class="content-area <?php echo esc_attr( $sidebar_pos ); ?> <?php echo esc_attr( apply_filters( 'sydney_content_area_class', $width ) ); ?>">
			<main id="main" class="post-wrap" role="main">
		<?php
	}

	public static function sydeny_single_job_after_content(){
		?>
			</main>
		</div>
		<?php
		do_action( 'sydney_get_sidebar' );
	}

	public static function go_single_job_before_content(){
		?>
		<article <?php post_class(); ?> id="post-<?php the_ID(); ?>">
		<?php
	}

	public static function go_single_job_after_content(){
		?>
		</article>
		<?php
	}

	public static function popularfx_single_job_before_content(){
		?>
		<main id="primary" class="site-main">
			<article class="article" id="post-<?php the_ID(); ?>">
		<?php
	}

	public static function popularfx_single_job_after_content(){
		?>
			</article>
		</main>
		<?php
		get_sidebar();
	}

	public static function generatepress_single_job_before_content(){
		?>
		<div <?php generate_do_attr( 'content' ); ?>>
			<main <?php generate_do_attr( 'main' ); ?>>
		<?php
	}

	public static function generatepress_single_job_after_content(){
		?>
			</main>
		</div>
		<?php
		get_sidebar();
	}

	public static function kadence_single_job_before_content(){
		?>
		<div id="primary" class="content-area">
			<div class="content-container site-container">
				<main id="main" class="site-main" role="main">
					<div class="content-wrap">
						<article id="post-<?php the_ID(); ?>" <?php post_class( 'entry content-bg single-entry' ); ?>>
							<div class="entry-content-wrap">
		<?php
	}

	public static function kadence_single_job_after_content(){
		?>
							</div>
						</article>
					</div>
				</main>
			</div>
		</div>
		<?php
	}

	public static function flatsome_single_job_before_content(){
		?>
		<div id="content" class="blog-wrapper blog-single page-wrapper row row-large row-divided">
		<?php
	}

	public static function flatsome_single_job_after_content(){
		?>
		</div>
		<?php
	}

	public static function divi_single_job_before_content(){
		?>
		<div id="main-content">
			<div class="container">
				<div id="content-area" class="clearfix">
					<div id="left-area">
					<?php
	}

	public static function divi_single_job_after_content(){
		?>
					</div>
					<?php get_sidebar(); ?>
				</div>
			</div>
		</div>
		<?php
	}

}

THJMF_Theme_Support::init();

endif;