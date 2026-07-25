// ==UserScript==
// @name         JavDB 磁力播放（纯按钮版）
// @namespace    http://cnb.cool/fish2035
// @version      1.1
// @description  在磁力链接旁添加播放按钮，不干扰页面布局
// @author       WebHome Dev
// @match        *://javdb574.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 只在详情页执行（路径包含 /v/）
    if (!window.location.pathname.includes('/v/')) {
        return;
    }

    console.log('[JavDB] 详情页，准备添加播放按钮');

    // 等待页面加载
    setTimeout(function() {

        // 1. 查找所有磁力链接
        var magnetLinks = document.querySelectorAll('a[href^="magnet:"]');

        // 如果没找到，尝试从 data-clipboard-text 查找
        if (magnetLinks.length === 0) {
            var copyBtns = document.querySelectorAll('[data-clipboard-text]');
            copyBtns.forEach(function(btn) {
                var url = btn.getAttribute('data-clipboard-text') || '';
                if (url.indexOf('magnet:') === 0) {
                    addPlayButton(btn, url, btn.textContent.trim() || '磁力链接');
                }
            });
            console.log('[JavDB] 从复制按钮提取并添加按钮');
            return;
        }

        // 2. 为每个磁力链接添加播放按钮
        magnetLinks.forEach(function(link) {
            var url = link.getAttribute('href');
            var title = link.textContent.trim() || '磁力链接';
            addPlayButton(link, url, title);
        });

        console.log('[JavDB] 已添加', magnetLinks.length, '个播放按钮');

    }, 1000);

    // 3. 添加播放按钮（不插入任何提示条）
    function addPlayButton(refElement, url, title) {
        // 防止重复添加
        if (refElement.parentElement.querySelector('.javdb-play-btn')) return;

        var btn = document.createElement('button');
        btn.className = 'javdb-play-btn';
        btn.textContent = '▶ 播放';
        btn.style.cssText = [
            'margin-left: 8px;',
            'padding: 2px 12px;',
            'background: #ff5722;',
            'color: #fff;',
            'border: none;',
            'border-radius: 4px;',
            'cursor: pointer;',
            'font-size: 13px;',
            'vertical-align: middle;',
            'white-space: nowrap;'
        ].join('');

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            handlePlay(url, title, this);
        });

        // 插入到参考元素后面（不破坏原有结构）
        refElement.parentElement.insertBefore(btn, refElement.nextSibling);
    }

    // 4. 播放处理
    function handlePlay(url, title, btn) {
        if (typeof window.fm === 'undefined') {
            alert('请使用 WebHome App 打开此页面');
            return;
        }

        var origText = btn.textContent;
        btn.textContent = '⏳ 加载中';
        btn.style.background = '#FF9800';
        btn.disabled = true;

        try {
            window.fm.pan.play({
                type: 'magnet',
                url: url,
                title: title || '磁力链接'
            }).then(function() {
                btn.textContent = '✅ 已推送';
                btn.style.background = '#4CAF50';
                setTimeout(function() {
                    btn.textContent = origText;
                    btn.style.background = '#ff5722';
                    btn.disabled = false;
                }, 3000);
            }).catch(function(err) {
                console.error('[JavDB] 播放失败:', err);
                btn.textContent = '❌ 失败';
                btn.style.background = '#f44336';
                btn.disabled = false;
                alert('播放失败: ' + (err.message || '未知错误'));
            });
        } catch (err) {
            console.error('[JavDB] 异常:', err);
            btn.textContent = '❌ 异常';
            btn.style.background = '#f44336';
            btn.disabled = false;
            alert('播放异常: ' + err.message);
        }
    }

})();