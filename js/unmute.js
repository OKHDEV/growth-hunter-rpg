/**
 * iOS Silent / Mute Switch Bypass & Web Audio Unmuter
 * Combines Spencer Evans' battle-tested unmute.js architecture
 * with modern W3C navigator.audioSession ('playback') standard for iOS 16.4+ & iOS 17/18+.
 * Forces iOS Safari to route Web Audio API through the Media Playback channel (bypassing hardware mute switch).
 */
(function(window) {
  'use strict';

  // Apply modern W3C AudioSession category 'playback' (iOS 16.4+, iOS 17, iOS 18+)
  function applyAudioSessionPlayback() {
    if (typeof navigator !== 'undefined' && 'audioSession' in navigator && navigator.audioSession) {
      try {
        if (navigator.audioSession.type !== 'playback') {
          navigator.audioSession.type = 'playback';
        }
      } catch (e) {}
    }
  }

  // Pre-apply immediately
  applyAudioSessionPlayback();

  function unmute(context, allowBackgroundPlayback, forceIOSBehavior) {
    if (allowBackgroundPlayback === void 0) { allowBackgroundPlayback = false; }
    if (forceIOSBehavior === void 0) { forceIOSBehavior = false; }

    applyAudioSessionPlayback();

    // Determine page visibility api
    var pageVisibilityAPI;
    if (document.hidden !== undefined)
      pageVisibilityAPI = { hidden: "hidden", visibilitychange: "visibilitychange" };
    else if (document.webkitHidden !== undefined)
      pageVisibilityAPI = { hidden: "webkitHidden", visibilitychange: "webkitvisibilitychange" };
    else if (document.mozHidden !== undefined)
      pageVisibilityAPI = { hidden: "mozHidden", visibilitychange: "mozvisibilitychange" };
    else if (document.msHidden !== undefined)
      pageVisibilityAPI = { hidden: "msHidden", visibilitychange: "msvisibilitychange" };

    function addEventListeners(target, events, handler, capture, passive) {
      for (var i = 0; i < events.length; ++i)
        target.addEventListener(events[i], handler, { capture: capture, passive: passive });
    }
    function removeEventListeners(target, events, handler, capture, passive) {
      for (var i = 0; i < events.length; ++i)
        target.removeEventListener(events[i], handler, { capture: capture, passive: passive });
    }
    function noop() {}

    // Comprehensive iOS / iPadOS Detection
    var ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent.toLowerCase() : '';
    var isIOS = (forceIOSBehavior ||
      (ua.indexOf("iphone") >= 0 && ua.indexOf("like iphone") < 0) ||
      (ua.indexOf("ipad") >= 0 && ua.indexOf("like ipad") < 0) ||
      (ua.indexOf("ipod") >= 0 && ua.indexOf("like ipod") < 0) ||
      (ua.indexOf("mac os x") >= 0 && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
      (typeof navigator !== 'undefined' && typeof navigator.vendor === 'string' && navigator.vendor.indexOf('Apple') >= 0 && navigator.maxTouchPoints > 0) ||
      (typeof navigator !== 'undefined' && typeof navigator.platform === 'string' && /iPhone|iPad|iPod/.test(navigator.platform))
    );

    var allowPlayback = true;

    function updatePlaybackState() {
      var shouldAllowPlayback = (allowBackgroundPlayback || (
        (!pageVisibilityAPI || !document[pageVisibilityAPI.hidden]) &&
        (!isIOS || document.hasFocus())
      ) ? true : false);

      if (shouldAllowPlayback !== allowPlayback) {
        allowPlayback = shouldAllowPlayback;
        updateChannelState(false);
        updateContextState();
      }
    }

    function doc_visChange() {
      updatePlaybackState();
    }
    if (pageVisibilityAPI)
      addEventListeners(document, [pageVisibilityAPI.visibilitychange], doc_visChange, true, true);

    function win_focusChange(evt) {
      if (evt && evt.target !== window) return;
      updatePlaybackState();
    }
    if (isIOS)
      addEventListeners(window, ["focus", "blur"], win_focusChange, true, true);

    function updateContextState() {
      if (allowPlayback) {
        if (context && context.state !== "running" && context.state !== "closed") {
          if (hasMediaPlaybackEventOccurred) {
            var p = context.resume();
            if (p) p.then(noop, noop).catch(noop);
          }
        }
      } else {
        if (context && context.state === "running") {
          var p = context.suspend();
          if (p) p.then(noop, noop).catch(noop);
        }
      }
    }

    function context_statechange(evt) {
      if (!evt || !evt.unmute_handled) {
        evt.unmute_handled = true;
        updateContextState();
      }
    }
    if (context) {
      addEventListeners(context, ["statechange"], context_statechange, true, true);
      if (!context.onstatechange) context.onstatechange = context_statechange;
    }

    // HTML Audio Channel State for forcing Media Playback route
    var channelTag = null;

    function huffman(count, repeatStr) {
      var e = repeatStr;
      for (; count > 1; count--) e += repeatStr;
      return e;
    }

    // High quality 0.01s silent MP3 (VBR220-260 Joint Stereo 859B)
    var silence = "data:audio/mpeg;base64,//uQx" + huffman(23, "A") + "WGluZwAAAA8AAAACAAACcQCA" + huffman(16, "gICA") + huffman(66, "/") + "8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkI" + huffman(320, "A") + "//sQxAADgnABGiAAQBCqgCRMAAgEAH" + huffman(15, "/") + "7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq" + huffman(18, "/") + "9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAw" + huffman(97, "V") + "Q==";

    function updateChannelState(isMediaPlaybackEvent) {
      if (isIOS) {
        applyAudioSessionPlayback();
        if (allowPlayback) {
          if (isMediaPlaybackEvent) {
            if (!channelTag) {
              channelTag = document.createElement("audio");
              channelTag.setAttribute('x-webkit-airplay', 'deny');
              channelTag.setAttribute('playsinline', 'true');
              channelTag.setAttribute('webkit-playsinline', 'true');
              channelTag.controls = false;
              channelTag.disableRemotePlayback = true;
              channelTag.preload = "auto";
              channelTag.src = silence;
              channelTag.loop = true;
              channelTag.style.position = 'fixed';
              channelTag.style.left = '-9999px';
              channelTag.style.bottom = '0';
              channelTag.style.width = '1px';
              channelTag.style.height = '1px';
              channelTag.style.opacity = '0.01';
              channelTag.style.pointerEvents = 'none';
              if (document.body) {
                document.body.appendChild(channelTag);
              }
              channelTag.load();
            } else if (!channelTag.parentNode && document.body) {
              document.body.appendChild(channelTag);
            }
            if (channelTag.paused) {
              var p = channelTag.play();
              if (p) p.then(noop, destroyChannelTag).catch(destroyChannelTag);
            }
          }
        } else {
          destroyChannelTag();
        }
      }
    }

    function destroyChannelTag() {
      if (channelTag) {
        channelTag.src = "about:blank";
        channelTag.load();
        if (channelTag.parentNode) {
          channelTag.parentNode.removeChild(channelTag);
        }
        channelTag = null;
      }
    }

    var mediaPlaybackEvents = [
      "click", "contextmenu", "auxclick", "dblclick",
      "mousedown", "mouseup", "touchstart", "touchend",
      "pointerdown", "pointerup", "keydown", "keyup"
    ];
    var hasMediaPlaybackEventOccurred = false;

    function win_mediaPlaybackEvent() {
      applyAudioSessionPlayback();
      hasMediaPlaybackEventOccurred = true;
      updateChannelState(true);
      updateContextState();
      if (context && context.state === 'running') {
        try {
          var buf = context.createBuffer(1, 1, 22050);
          var src = context.createBufferSource();
          src.buffer = buf;
          src.connect(context.destination);
          src.start(0);
        } catch (e) {}
      }
    }
    addEventListeners(window, mediaPlaybackEvents, win_mediaPlaybackEvent, true, true);

    return {
      dispose: function() {
        destroyChannelTag();
        if (pageVisibilityAPI)
          removeEventListeners(document, [pageVisibilityAPI.visibilitychange], doc_visChange, true, true);
        if (isIOS)
          removeEventListeners(window, ["focus", "blur"], win_focusChange, true, true);
        removeEventListeners(window, mediaPlaybackEvents, win_mediaPlaybackEvent, true, true);
        if (context) {
          removeEventListeners(context, ["statechange"], context_statechange, true, true);
          if (context.onstatechange === context_statechange)
            context.onstatechange = null;
        }
      }
    };
  }

  // Export globally
  window.unmute = unmute;
  window.applyAudioSessionPlayback = applyAudioSessionPlayback;

})(typeof window !== 'undefined' ? window : this);
