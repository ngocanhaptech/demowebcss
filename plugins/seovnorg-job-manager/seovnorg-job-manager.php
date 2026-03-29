<?php
/*
Plugin Name: seovnorg-job-manager
Description: Hệ thống quản lý tuyển dụng chuyên nghiệp dành cho seovnorg, hỗ trợ REST API và Flatsome UX Builder.
Version: 1.0.0
Author: seovnorg Team
Text Domain: seovnorg-job-manager
*/

/**
 * Ngăn chặn truy cập trực tiếp vào tệp tin để đảm bảo bảo mật [3].
 */
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Sử dụng Class để đóng gói chức năng, tránh xung đột tên hàm (Naming Conflicts) [4, 5].
 */
class Seovnorg_Job_Manager {

    public function __construct() {
        // Đăng ký Custom Post Type khi WordPress khởi tạo [6].
        add_action('init', array($this, 'register_job_cpt'));
        
        // Kích hoạt hỗ trợ UX Builder cho loại bài đăng này [7, 8].
        add_action('init', array($this, 'enable_ux_builder_integration'));
    }

    /**
     * Đăng ký Custom Post Type 'jobs' với các nhãn tiếng Việt để tối ưu trải nghiệm người dùng [9, 10].
     */
    public function register_job_cpt() {
        $labels = array(
            'name'               => 'Tuyển dụng',
            'singular_name'      => 'Tin tuyển dụng',
            'menu_name'          => 'Tuyển dụng',
            'add_new'            => 'Thêm tin mới',
            'add_new_item'       => 'Thêm tin tuyển dụng mới',
            'edit_item'          => 'Sửa tin tuyển dụng',
            'all_items'          => 'Tất cả tin tuyển dụng',
            'view_item'          => 'Xem tin trên web',
            'search_items'       => 'Tìm kiếm tin tuyển dụng',
            'not_found'          => 'Không tìm thấy tin nào',
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'has_archive'        => true, // Cho phép trang lưu trữ tin tuyển dụng [11].
            'show_in_rest'       => true, // Bật để hỗ trợ trình soạn thảo Gutenberg và REST API [12, 13].
            'menu_icon'          => 'dashicons-businessperson', // Sử dụng icon Dashicons phù hợp [14].
            'supports'           => array('title', 'editor', 'author', 'thumbnail', 'excerpt'), // Các thành phần hỗ trợ [12].
            'rewrite'            => array('slug' => 'tuyen-dung'), // Tùy chỉnh đường dẫn tĩnh chuẩn SEO [15, 16].
            'capability_type'    => 'post',
        );

        register_post_type('jobs', $args);
    }

    /**
     * Tích hợp sâu vào hệ sinh thái Flatsome thông qua hàm API add_ux_builder_post_type [7, 17].
     */
    public function enable_ux_builder_integration() {
        if (function_exists('add_ux_builder_post_type')) {
            add_ux_builder_post_type('jobs');
        }
    }
}

/**
 * Khởi tạo đối tượng duy nhất của plugin để vận hành hệ thống [18, 19].
 */
new Seovnorg_Job_Manager();