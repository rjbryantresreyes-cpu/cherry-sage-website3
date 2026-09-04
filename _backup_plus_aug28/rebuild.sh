#!/bin/bash
# Correct build order for Cherry Sage Site 2.
# build_site.py no longer writes blog/articles/testimonials (owned by their dedicated builders).
# build_posts.py is the OLD post/blog builder — build_blog.py SUPERSEDES it, so build_posts MUST
# run BEFORE build_blog so build_blog's image-card blog + filter chips win.
# build_testimonials + build_blog must run before build_home (it reads _home_testi.json / _home_preview.json).
cd /c/BBC/cherry-sage-website3
set -e
python build_site.py          > /dev/null
python build_posts.py         > /dev/null   # OLD builder first
python build_blog.py          > /dev/null   # supersedes build_posts (blog + articles + post pages)
python build_testimonials.py  > /dev/null   # testimonials.html + feedback.html + _home_testi.json
python build_home.py          > /dev/null   # reads _home_testi.json + _home_preview.json
python build_shop.py          > /dev/null
python build_horoscope.py     > /dev/null
python build_pull.py          > /dev/null
python build_status_page.py  > /dev/null
python build_sitemap_page.py > /dev/null
python build_sitemap.py     > /dev/null
echo "rebuild complete"
