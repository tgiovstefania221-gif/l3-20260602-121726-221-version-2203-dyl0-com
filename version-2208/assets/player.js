(function () {
    function bindPlayer(container) {
        var video = container.querySelector('video[data-hls]');
        var overlay = container.querySelector('.player-overlay');
        var started = false;
        var hlsInstance = null;
        if (!video || !overlay) {
            return;
        }
        var start = function () {
            if (started) {
                video.play();
                return;
            }
            started = true;
            overlay.classList.add('is-hidden');
            var src = video.getAttribute('data-hls');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.play().catch(function () {
                    overlay.classList.remove('is-hidden');
                    started = false;
                });
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        overlay.classList.remove('is-hidden');
                        started = false;
                    });
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        video.src = src;
                    }
                });
            } else {
                video.src = src;
                video.play().catch(function () {
                    overlay.classList.remove('is-hidden');
                    started = false;
                });
            }
        };
        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
    document.querySelectorAll('[data-player]').forEach(bindPlayer);
})();
