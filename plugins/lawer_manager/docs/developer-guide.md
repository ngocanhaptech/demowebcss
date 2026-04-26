# Developer Guide – {Plugin Name}

## 1. Giới thiệu
Plugin này cung cấp shortcode `ux_{entity}_list`, tích hợp UX Builder, AJAX relay và quickview.

## 2. Cấu trúc thư mục
- `includes/`: chứa tất cả class.
- `assets/`: CSS, JS.
- `{prefix}-manager.php`: bootstrap.

## 3. Các class chính
- `TM_CPT_Base`, `TM_CPT_{Entity}`: đăng ký CPT và taxonomy.
- `TM_Shortcode_Base`, `TM_Shortcode_{Entity}_List`: shortcode danh sách.
- `TM_UX_Element_Base`, `TM_UX_Element_{Entity}_List`: element cho UX Builder.
- `TM_Assets_Manager`: enqueue tài nguyên.
- `TM_Meta_Box_Helper`: tạo meta box nhanh.

## 4. Mở rộng
### 4.1 Thêm meta box mới
```php
add_action('add_meta_boxes', function() {
    TM_Meta_Box_Helper::add_textarea( $post, 'field_id', 'Label', 'Mô tả' );
});
add_action('save_post_{post_type}', function($post_id) {
    TM_Meta_Box_Helper::save($post_id, 'nonce_action', 'nonce_name', ['field_id' => 'wp_kses_post']);
});

4.2 Đổi style box
Trong render_grid() sửa HTML hoặc tạo file template riêng.

4.3 Thêm filter đầu ra
Sử dụng hook tm_{entity}_box_html.

5. Relay & Quickview
Relay hoạt động tự động nếu shortcode có relay="pagination".

Quickview yêu cầu mỗi post có meta _ux_{entity}_shortcode_quickview (textarea chứa shortcode).

6. Debug
Bật WP_DEBUG để xem lỗi.

Kiểm tra network tab khi click quickview / load more.

Sử dụng error_log(print_r($query->request, true)) để xem câu SQL.

7. Diagram
Tham khảo docs/diagrams.mmd.

## 8. Kết luận

Với boilerplate trên, team có thể **tạo ra các plugin khác nhau chỉ ** bằng cách copy-paste và sửa tên. Tất cả đều tương thích với Flatsome UX Builder, hỗ trợ relay AJAX, quickview và dễ bảo trì nhờ các base class.

**Lưu ý quan trọng**: Luôn kiểm tra sự tồn tại của hàm `add_ux_builder_shortcode` trước khi gọi, và chỉ enqueue assets khi shortcode thực sự xuất hiện trong nội dung để tránh tải thừa.

---
Developer Guide
---

1. Kiến trúc tổng thể (đã được thiết kế)
flowchart TD
    A[UX Builder] --> B[Shortcode ux_team_members]
    B --> C[PHP Renderer]
    C --> D[WP_Query]
    D --> E[Flatsome Repeater]
    E --> F[HTML Output]
    
    G[Browser] --> H[Relay JS]
    H --> I[Ajax Request]
    I --> C
    H --> J[Quickview JS]
    J --> K[Ajax Handler]
    K --> L[do_shortcode]
    L --> M[Modal Popup]
CPT & Taxonomy: quản lý dữ liệu.

Meta Box: lưu thông tin bổ sung (chức danh, shortcode quickview).

Shortcode + UX Builder Element: hiển thị danh sách, có đầy đủ tùy chỉnh giao diện, bộ lọc, phân trang.

Relay JS: hỗ trợ AJAX tải thêm trang (infinite scroll / nút “Xem thêm”) mà không cần reload.

Quickview JS: hiển thị popup nội dung chi tiết từ shortcode tùy chỉnh (ví dụ Flatsome Block).

2. Sequence Diagrams
2.1 Render danh sách lần đầu
sequenceDiagram
    participant Browser
    participant Shortcode as [ux_team_members]
    participant Renderer as render()
    participant WP_Query
    participant FlatsomeRepeater

    Browser->>Shortcode: parse shortcode
    Shortcode->>Renderer: gọi với $atts
    Renderer->>WP_Query: new WP_Query($args)
    WP_Query-->>Renderer: danh sách post
    Renderer->>FlatsomeRepeater: get_flatsome_repeater_start()
    loop each team member
        Renderer->>Renderer: lấy thumbnail, meta, taxonomy
        Renderer-->>Browser: HTML box
    end
    Renderer->>FlatsomeRepeater: get_flatsome_repeater_end()
    Renderer-->>Browser: hoàn chỉnh HTML

2.2 Relay AJAX pagination
sequenceDiagram
    participant Browser
    participant RelayJS as Flatsome_Relay
    participant Ajax as admin-ajax.php
    participant Renderer
    participant CustomJS as team-relay.js

    Browser->>RelayJS: click load more
    RelayJS->>Ajax: POST (relayData.postType, page_number)
    Ajax->>Renderer: do_shortcode với page_number mới
    Renderer-->>Ajax: JSON {success:true, data: HTML}
    Ajax-->>RelayJS: response
    RelayJS->>CustomJS: trigger event 'flatsome-relay-request-done'
    CustomJS->>CustomJS: thay thế container, re-init packery, attach Flatsome events
    CustomJS-->>Browser: cập nhật danh sách

2.3 Quickview từ shortcode meta
sequenceDiagram
    participant Browser
    participant QuickviewJS
    participant Ajax
    participant Handler as tm_team_quickview_ajax
    participant ShortcodeParser as do_shortcode

    Browser->>QuickviewJS: click button "Quick view"
    QuickviewJS->>Ajax: POST (shortcode = [block id="..."])
    Ajax->>Handler: wp_ajax_tm_team_quickview
    Handler->>ShortcodeParser: do_shortcode($shortcode)
    ShortcodeParser-->>Handler: HTML content
    Handler-->>Ajax: JSON {html: ...}
    Ajax-->>QuickviewJS: response
    QuickviewJS->>Browser: mở magnificPopup hiển thị nội dung


3. Class Diagram (high-level)
classDiagram
    class CPT_Base {
        <<abstract>>
        +$post_type
        +$args
        +register()
    }

    class TeamMemberCPT {
        +__construct()
    }

    class Shortcode_Base {
        <<abstract>>
        +$tag
        +register()
        +render($atts)*
    }

    class TeamListShortcode {
        +render($atts)
        -build_query_args($atts)
    }

    class UX_Element_Base {
        <<abstract>>
        +$shortcode
        +$name
        +$options
        +register()
    }

    class TeamListElement {
        +__construct()
    }

    class AssetsManager {
        +register()
        +enqueue_frontend()
        +enqueue_admin()
    }

    class MetaBoxHelper {
        +add_meta_box($id, $title, $post_type, $callback)
        +save_post($post_id, $nonce_action, $fields)
    }

    CPT_Base <|-- TeamMemberCPT
    Shortcode_Base <|-- TeamListShortcode
    UX_Element_Base <|-- TeamListElement
    AssetsManager --> TeamListShortcode : enqueue when shortcode present
    MetaBoxHelper --> TeamMemberCPT : attach meta boxes


4. Boilerplate Plugin – Cấu trúc thư mục chuẩn
text
wp-content/plugins/{your-prefix}-manager/
├── {your-prefix}-manager.php          # Plugin bootstrap
├── includes/
│   ├── class-cpt-base.php
│   ├── class-cpt-{entity}.php          # Ví dụ: class-cpt-team-member.php
│   ├── class-shortcode-base.php
│   ├── class-shortcode-{entity}-list.php
│   ├── class-ux-element-base.php
│   ├── class-ux-element-{entity}-list.php
│   ├── class-assets-manager.php
│   ├── class-meta-box-helper.php
│   └── class-{entity}-repository.php   (tuỳ chọn, tách query)
├── assets/
│   ├── css/
│   │   └── {prefix}-frontend.css
│   └── js/
│       ├── {prefix}-relay.js
│       └── {prefix}-quickview.js
└── docs/
    ├── developer-guide.md
    └── diagrams.mmd
5. Hướng dẫn từng bước tạo plugin mới
5.1 Tạo file plugin bootstrap ({prefix}-manager.php)
php
<?php
/**
 * Plugin Name: Team Manager
 * Description: Quản lý Team Member với UX Builder, Relay, Quickview
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: tm
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'TM_PLUGIN_FILE', __FILE__ );
define( 'TM_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'TM_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );

// Autoload các class (nếu dùng composer thì có thể, không thì require thủ công)
require_once TM_PLUGIN_PATH . 'includes/class-cpt-base.php';
require_once TM_PLUGIN_PATH . 'includes/class-cpt-team-member.php';
require_once TM_PLUGIN_PATH . 'includes/class-meta-box-helper.php';
require_once TM_PLUGIN_PATH . 'includes/class-shortcode-base.php';
require_once TM_PLUGIN_PATH . 'includes/class-shortcode-team-list.php';
require_once TM_PLUGIN_PATH . 'includes/class-ux-element-base.php';
require_once TM_PLUGIN_PATH . 'includes/class-ux-element-team-list.php';
require_once TM_PLUGIN_PATH . 'includes/class-assets-manager.php';

// Khởi tạo các thành phần
function tm_init() {
    $cpt = new TM_CPT_Team_Member();
    $cpt->register();

    $shortcode = new TM_Shortcode_Team_List();
    $shortcode->register();

    $ux_element = new TM_UX_Element_Team_List();
    $ux_element->register();

    $assets = new TM_Assets_Manager();
    $assets->register();
}
add_action( 'plugins_loaded', 'tm_init' );

// Handler AJAX cho quickview
require_once TM_PLUGIN_PATH . 'includes/ajax-quickview-handler.php';
5.2 Base class CPT (class-cpt-base.php)
php
<?php
abstract class TM_CPT_Base {
    protected $post_type;
    protected $args = [];

    public function register() {
        add_action( 'init', [ $this, 'do_register' ] );
    }

    public function do_register() {
        register_post_type( $this->post_type, $this->args );
    }
}
5.3 Class CPT cụ thể (class-cpt-team-member.php)
php
<?php
class TM_CPT_Team_Member extends TM_CPT_Base {
    public function __construct() {
        $this->post_type = 'team_member';
        $this->args = [
            'labels' => [
                'name'               => __( 'Team', 'tm' ),
                'singular_name'      => __( 'Team Member', 'tm' ),
                'add_new_item'       => __( 'Add New Team Member', 'tm' ),
                'edit_item'          => __( 'Edit Team Member', 'tm' ),
                'all_items'          => __( 'All Team Members', 'tm' ),
            ],
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'menu_icon'          => 'dashicons-groups',
            'supports'           => [ 'title', 'editor', 'thumbnail', 'excerpt', 'page-attributes' ],
            'has_archive'        => 'doi-ngu-luat-su',
            'rewrite'            => [ 'slug' => 'doi-ngu-luat-su' ],
            'show_in_rest'       => true,
        ];
    }
}
5.4 Taxonomy (thêm riêng nếu cần) – đặt trong cùng file CPT hoặc tạo class riêng
php
// có thể thêm method register_taxonomy() trong CPT class
public function register_taxonomies() {
    register_taxonomy( 'team_category', 'team_member', [
        'labels' => [ 'name' => 'Team Categories' ],
        'hierarchical' => true,
        'rewrite' => [ 'slug' => 'team-cat' ],
        'show_in_rest' => true,
    ] );
}
// gọi trong tm_init()
5.5 Meta Box Helper (class-meta-box-helper.php)
php
<?php
class TM_Meta_Box_Helper {
    public static function add_textarea( $post, $field_id, $field_label, $description = '' ) {
        $value = get_post_meta( $post->ID, $field_id, true );
        ?>
        <p>
            <label for="<?php echo esc_attr( $field_id ); ?>">
                <strong><?php echo esc_html( $field_label ); ?></strong>
            </label><br>
            <textarea name="<?php echo esc_attr( $field_id ); ?>" id="<?php echo esc_attr( $field_id ); ?>" rows="2" style="width:100%;"><?php echo esc_textarea( $value ); ?></textarea>
            <?php if ( $description ) : ?>
                <small><?php echo esc_html( $description ); ?></small>
            <?php endif; ?>
        </p>
        <?php
    }

    public static function save( $post_id, $nonce_action, $nonce_name, $fields ) {
        if ( ! isset( $_POST[ $nonce_name ] ) || ! wp_verify_nonce( $_POST[ $nonce_name ], $nonce_action ) ) {
            return;
        }
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
        if ( ! current_user_can( 'edit_post', $post_id ) ) return;

        foreach ( $fields as $field_name => $sanitize_callback ) {
            if ( isset( $_POST[ $field_name ] ) ) {
                $value = call_user_func( $sanitize_callback, wp_unslash( $_POST[ $field_name ] ) );
                update_post_meta( $post_id, $field_name, $value );
            }
        }
    }
}
Sử dụng trong hook add_meta_boxes và save_post.

5.6 Base Shortcode (class-shortcode-base.php)
php
<?php
abstract class TM_Shortcode_Base {
    protected $tag;

    public function register() {
        add_shortcode( $this->tag, [ $this, 'render' ] );
    }

    abstract public function render( $atts );
}
5.7 Shortcode danh sách (class-shortcode-team-list.php)
php
<?php
class TM_Shortcode_Team_List extends TM_Shortcode_Base {
    protected $tag = 'ux_team_members';

    public function render( $atts ) {
        $atts = shortcode_atts( [
            'posts'         => 8,
            'ids'           => '',
            'team_cat'      => '',
            'orderby'       => 'menu_order',
            'order'         => 'ASC',
            'columns'       => 3,
            'style'         => 'normal',
            'show_quickview'=> 'false',
            // ... thêm các layout option khác
        ], $atts );

        // Xây dựng query args
        $args = [
            'post_type'      => 'team_member',
            'post_status'    => 'publish',
            'posts_per_page' => intval( $atts['posts'] ),
            'orderby'        => $atts['orderby'],
            'order'          => $atts['order'],
        ];

        if ( ! empty( $atts['team_cat'] ) ) {
            $args['tax_query'] = [[
                'taxonomy' => 'team_category',
                'field'    => 'slug',
                'terms'    => explode( ',', $atts['team_cat'] ),
            ]];
        }

        if ( ! empty( $atts['ids'] ) ) {
            $args['post__in'] = explode( ',', $atts['ids'] );
            $args['posts_per_page'] = -1;
            $args['orderby'] = 'post__in';
        }

        $query = new WP_Query( $args );
        if ( ! $query->have_posts() ) return '';

        ob_start();
        // Sử dụng Flatsome repeater (có thể copy từ ux_team_members-3.php)
        $this->render_grid( $query, $atts );
        return ob_get_clean();
    }

    private function render_grid( $query, $atts ) {
        // Gọi hàm get_flatsome_repeater_start, loop, get_flatsome_repeater_end
        // tương tự mẫu cũ, nhưng có bổ sung quickview button
        while ( $query->have_posts() ) {
            $query->the_post();
            $shortcode_qv = get_post_meta( get_the_ID(), '_ux_team_shortcode_quickview', true );
            $has_qv = $shortcode_qv && $atts['show_quickview'] === 'true';
            ?>
            <div class="col post-item">
                <div class="col-inner">
                    <!-- box layout giống Flatsome -->
                    <?php if ( $has_qv ) : ?>
                        <button class="button small tm-quickview-btn" data-shortcode="<?php echo esc_attr( $shortcode_qv ); ?>">
                            <?php esc_html_e( 'Quick view', 'tm' ); ?>
                        </button>
                    <?php endif; ?>
                </div>
            </div>
            <?php
        }
        wp_reset_postdata();
    }
}
5.8 Base UX Builder Element (class-ux-element-base.php)
php
<?php
abstract class TM_UX_Element_Base {
    protected $shortcode;
    protected $name;
    protected $options = [];

    public function register() {
        if ( ! function_exists( 'add_ux_builder_shortcode' ) ) return;
        add_ux_builder_shortcode( $this->shortcode, [
            'name'      => $this->name,
            'category'  => __( 'Content', 'tm' ),
            'wrap'      => false,
            'options'   => $this->options,
        ] );
    }
}
5.9 Element cụ thể (class-ux-element-team-list.php)
php
<?php
class TM_UX_Element_Team_List extends TM_UX_Element_Base {
    public function __construct() {
        $this->shortcode = 'ux_team_members';
        $this->name      = __( 'Team Members', 'tm' );
        $this->options   = [
            'content_group' => [
                'type'    => 'group',
                'heading' => __( 'Content', 'tm' ),
                'options' => [
                    'posts'    => [ 'type' => 'scrubfield', 'heading' => 'Số lượng', 'default' => 8 ],
                    'team_cat' => [ 'type' => 'select', 'heading' => 'Danh mục', 'options' => $this->get_team_cats() ],
                    'ids'      => [ 'type' => 'select', 'heading' => 'Chọn thành viên', 'options' => $this->get_team_members() ],
                ],
            ],
            'style_group' => [
                'type'    => 'group',
                'heading' => __( 'Style', 'tm' ),
                'options' => [
                    'style'   => [ 'type' => 'select', 'heading' => 'Kiểu box', 'options' => [ 'normal' => 'Normal', 'bounce' => 'Bounce' ] ],
                    'columns' => [ 'type' => 'slider', 'heading' => 'Cột', 'default' => 3 ],
                ],
            ],
            'quickview_group' => [
                'type'    => 'group',
                'heading' => __( 'Quick View', 'tm' ),
                'options' => [
                    'show_quickview' => [ 'type' => 'select', 'heading' => 'Hiện nút quickview', 'default' => 'false', 'options' => [ 'false' => 'Không', 'true' => 'Có' ] ],
                ],
            ],
        ];
    }

    private function get_team_cats() {
        $terms = get_terms( [ 'taxonomy' => 'team_category', 'hide_empty' => false ] );
        $opts = [ '' => 'Tất cả' ];
        foreach ( $terms as $term ) $opts[ $term->slug ] = $term->name;
        return $opts;
    }

    private function get_team_members() {
        $members = get_posts( [ 'post_type' => 'team_member', 'posts_per_page' => -1, 'orderby' => 'title' ] );
        $opts = [ '' => '-- Tự động --' ];
        foreach ( $members as $m ) $opts[ $m->ID ] = $m->post_title;
        return $opts;
    }
}
5.10 Assets Manager (class-assets-manager.php)
php
<?php
class TM_Assets_Manager {
    public function register() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_frontend' ] );
    }

    public function enqueue_frontend() {
        global $post;
        if ( ! $post || ! has_shortcode( $post->post_content, 'ux_team_members' ) ) {
            return;
        }

        wp_enqueue_style( 'tm-frontend', TM_PLUGIN_URL . 'assets/css/tm-frontend.css', [], '1.0' );
        wp_enqueue_script( 'tm-relay', TM_PLUGIN_URL . 'assets/js/tm-relay.js', [ 'jquery' ], '1.0', true );
        wp_enqueue_script( 'tm-quickview', TM_PLUGIN_URL . 'assets/js/tm-quickview.js', [ 'jquery' ], '1.0', true );
        wp_localize_script( 'tm-quickview', 'tm_ajax', [ 'ajax_url' => admin_url( 'admin-ajax.php' ) ] );
    }
}
5.11 AJAX Quickview Handler (includes/ajax-quickview-handler.php)
php
<?php
add_action( 'wp_ajax_tm_team_quickview', 'tm_team_quickview_ajax' );
add_action( 'wp_ajax_nopriv_tm_team_quickview', 'tm_team_quickview_ajax' );

function tm_team_quickview_ajax() {
    $shortcode = isset( $_POST['shortcode'] ) ? wp_unslash( $_POST['shortcode'] ) : '';
    if ( ! $shortcode ) {
        wp_send_json_error( [ 'message' => 'Missing shortcode' ] );
    }
    $content = do_shortcode( $shortcode );
    wp_send_json_success( [ 'html' => $content ] );
}
5.12 JavaScript Quickview (assets/js/tm-quickview.js)
javascript
jQuery(function($) {
    $(document).on('click', '.tm-quickview-btn', function(e) {
        e.preventDefault();
        var $btn = $(this);
        var shortcode = $btn.data('shortcode');
        if (!shortcode) return;

        $.post(tm_ajax.ajax_url, {
            action: 'tm_team_quickview',
            shortcode: shortcode
        }, function(res) {
            if (res.success) {
                // Sử dụng Magnific Popup của Flatsome nếu có
                if ($.magnificPopup) {
                    $.magnificPopup.open({
                        items: { src: '<div class="tm-quickview-content">'+res.data.html+'</div>', type: 'inline' },
                        type: 'inline'
                    });
                } else {
                    alert(res.data.html); // fallback
                }
            }
        });
    });
});
5.13 Relay JS (assets/js/tm-relay.js)
Dựa vào team-members-relay.js cũ, chỉ cần sửa postType check:

javascript
jQuery(function($) {
    $(document).on('flatsome-relay-request-done', function(e, response, $container, relayData) {
        if (relayData.postType !== 'team_member') return;
        // Xử lý thay thế container, re-init packery, attach Flatsome events
        var $newContent = $(response.data);
        $container.replaceWith($newContent);
        Flatsome.attach($newContent);
        if ($newContent.find('.packery').length) {
            $newContent.imagesLoaded(function() {
                $newContent.packery();
            });
        }
    });
});
6. Tạo plugin mới cho đối tượng khác (Project, Service, …)
Chỉ cần copy thư mục boilerplate và thay thế:

Thành phần	Thay thế
team_member	project
team_category	project_category
TM_CPT_Team_Member	TM_CPT_Project
TM_Shortcode_Team_List	TM_Shortcode_Project_List
ux_team_members	ux_projects
tm-frontend.css	project-frontend.css
tm-quickview.js	giữ nguyên (hoặc đổi tên)
Sau đó đăng ký trong bootstrap. Với base class đã có, toàn bộ logic kế thừa chỉ cần viết lớp con override $post_type, $tag, $name, $options.