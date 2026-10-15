TRIPO PAGE LIGHT THEME

Recommended class: theme-light

HTML standalone demo: tripo3d-tutorials-theme-light.html
External CSS: tripo-page-theme-light.css

To switch a page to light mode, add the class to body:
<body class="theme-light">

For a WordPress page, add body_class('theme-light') in the theme/template or add the class using your body-class plugin. Enqueue tripo-page-theme-light.css after the base page stylesheet.

The light-mode overrides are scoped to body.theme-light, so removing the class disables these overrides. The existing mobile drawer keeps its own class "light-mode" and remains light independently of the page theme.
