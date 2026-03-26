<?php
/**
 * Single job page content wrapper end
 *
 * This template can be overridden by copying it to yourtheme/job-manager-career/global/wrapper-end.php
 *
 * @link       https://themehigh.com
 * @author     ThemeHigh
 * @package    job-manager-career
 * @subpackage job-manager-career/templates
 * @category   Template
 * @since      1.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

switch ( thjmf_get_theme_slug() ) {
	case 'twentyten':
		echo '</div></div>';
		get_sidebar();
		break;
	case 'twentyeleven':
		echo '</div>';
		echo '</div>';
		break;
	case 'twentytwelve':
		echo '</div></div>';
		get_sidebar();
		break;
	case 'twentythirteen':
		echo '</div></div>';
		break;
	case 'twentyfourteen':
		echo '</div>';
		echo '</div>';
		get_sidebar();
		break;
	case 'twentyfifteen':
		echo '</div></div>';
		break;
	case 'twentysixteen':
		echo '</main></div>';
		get_sidebar();
		break;
	case 'twentyseventeen':
		echo '</main>';
		echo '</div>';
		get_sidebar();
		echo '</div>';
		break;
	case 'twentynineteen':
		echo '</article></main></div>';
	case 'twentytwenty':
		echo '</main></section>';
		break;
	case 'astra':
		echo '</article></main></div>';
		get_sidebar();
		break;
	case 'oceanwp':
		echo '</article></div></div></div>';
		break;
	case 'hestia':
		echo '</article></div></div></div>';
		break;
	case 'storefront':
		echo '</div>';
		echo '</main>';
		get_sidebar();
		break;
	case 'bravada':
		echo '</main>';
		bravada_get_sidebar();
		echo '</div>';
	default:
		echo '</main></div>';
		break;
}
