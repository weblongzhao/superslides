/*! Superslides - v0.5.0 - 2012-12-02
* https://github.com/nicinabox/superslides
* Copyright (c) 2012 Nic Aitch; Licensed MIT */

var Superslides, name;

Superslides = function(el, options) {
  var $children, $container, $control, $window, adjustImagePosition, adjustSlidesSize, animator, findMultiplier, height, init, initialize, loadImage, multiplier, next, parse, parseHash, positions, prev, setHorizontalPosition, setVerticalPosition, setupChildren, setupContainers, that, width,
    _this = this;
  if (options == null) {
    options = {};
  }
  this.options = $.extend({
    delay: 5000,
    play: false,
    slide_speed: 'normal',
    slide_easing: 'linear',
    nav_class: 'slides-navigation',
    container_class: 'slides-container',
    pagination: false,
    hashchange: false,
    scrollable: true
  }, options);
  that = this;
  $window = $(window);
  $container = $("." + this.options.container_class);
  $children = $container.children();
  $control = $('<div>', {
    "class": 'slides-control'
  });
  multiplier = 1;
  init = false;
  width = $window.width();
  height = $window.height();
  initialize = function() {
    if (init) {
      return;
    }
    multiplier = findMultiplier();
    positions();
    _this.mobile = /mobile/i.test(navigator.userAgent);
    $control = $container.wrap($control).parent('.slides-control');
    setupContainers();
    _this.start();
    return _this;
  };
  setupContainers = function() {
    return $control.css({
      width: width * multiplier,
      height: height,
      left: -width
    });
  };
  setupChildren = function() {
    $children.not('.current').css({
      display: 'none',
      position: 'absolute',
      overflow: 'hidden',
      top: 0,
      left: width,
      zIndex: 0
    });
    return adjustSlidesSize($children);
  };
  loadImage = function($img, callback) {
    return $("<img>", {
      src: $img.attr('src')
    }).load(function() {
      if (callback instanceof Function) {
        return callback(this);
      }
    });
  };
  setVerticalPosition = function($img) {
    var scale_height;
    scale_height = width / $img.data('aspect-ratio');
    if (scale_height >= height) {
      return $img.css({
        top: -(scale_height - height) / 2
      });
    } else {
      return $img.css({
        top: 0
      });
    }
  };
  setHorizontalPosition = function($img) {
    var scale_width;
    scale_width = height * $img.data('aspect-ratio');
    if (scale_width >= width) {
      return $img.css({
        left: -(scale_width - width) / 2
      });
    } else {
      return $img.css({
        left: 0
      });
    }
  };
  adjustImagePosition = function($img) {
    if (!$img.data('aspect-ratio')) {
      loadImage($img, function(image) {
        $img.removeAttr('width').removeAttr('height');
        $img.data('aspect-ratio', image.width / image.height);
        return adjustImagePosition($img);
      });
      return;
    }
    setHorizontalPosition($img);
    return setVerticalPosition($img);
  };
  adjustSlidesSize = function($el) {
    that = _this;
    return $el.each(function(i) {
      $(this).width(width).height(height);
      $(this).css({
        left: width
      });
      return adjustImagePosition($('img', this).not('.keep-original'));
    });
  };
  findMultiplier = function() {
    if (_this.size() === 1) {
      return 1;
    } else {
      return 3;
    }
  };
  next = function() {
    var index;
    index = _this.current + 1;
    if (index === _this.size()) {
      index = 0;
    }
    return index;
  };
  prev = function() {
    var index;
    index = _this.current - 1;
    if (index === -1) {
      index = _this.size() - 1;
    }
    return index;
  };
  parse = function(direction) {
    switch (true) {
      case /next/.test(direction):
        return next();
      case /prev/.test(direction):
        return prev();
      case /\d/.test(direction):
        return direction;
      default:
        return next();
    }
  };
  parseHash = function(hash) {
    if (hash == null) {
      hash = window.location.hash;
    }
    hash = hash.replace(/^#/, '');
    if (hash) {
      return +hash;
    }
  };
  positions = function(current) {
    _this.current = current || 0;
    _this.next = next();
    _this.prev = prev();
    return false;
  };
  animator = function(callback) {
    var next_index, offset, position;
    that = _this;
    position = width * 2;
    offset = -position;
    if (!init && _this.current === 0) {
      next_index = _this.current;
    } else {
      next_index = _this.next;
    }
    $children.removeClass('current');
    $children.eq(next_index).addClass('current').css({
      left: position,
      display: 'block'
    });
    return $control.animate({
      useTranslate3d: _this.mobile,
      left: offset
    }, options.slide_speed, options.slide_easing, function() {
      if (typeof callback === 'function') {
        callback();
      }
      positions(_this.next);
      _this.animating = false;
      if (init) {
        return $container.trigger('slides.animated');
      } else {
        init = true;
        positions(0);
        return $container.trigger('slides.init');
      }
    });
  };
  this.$el = $(el);
  this.update = function() {
    positions();
    return $container.trigger('slides.changed');
  };
  this.destroy = function() {
    return $(el).removeData();
  };
  this.size = function() {
    return $container.children().length;
  };
  this.stop = function() {
    clearInterval(_this.play_id);
    return delete _this.play_id;
  };
  this.start = function() {
    setupChildren();
    $window.trigger('hashchange');
    _this.animate('next', function() {
      return $container.fadeIn('fast');
    });
    if (_this.options.play) {
      if (_this.play_id) {
        _this.stop();
      }
      _this.play_id = setInterval(function() {
        return false;
      }, options.delay);
    }
    return $container.trigger('slides.started');
  };
  this.animate = function(direction, callback) {
    var index;
    if (direction == null) {
      direction = 'next';
    }
    if (_this.animating) {
      return;
    }
    _this.animating = true;
    index = parse(direction);
    if (index > _this.size()) {
      return;
    }
    if (index === direction) {
      positions(index - 1);
    }
    return animator(callback);
  };
  $window.on('hashchange', function(e) {
    var index;
    index = parseHash();
    if (index) {
      return that.animate(index);
    }
  }).on('resize', function(e) {
    width = $window.width();
    height = $window.height();
    adjustSlidesSize($children);
    return setupContainers();
  }).on('click', "." + options.nav_class + " a", function(e) {
    e.preventDefault();
    that.stop();
    if ($(this).hasClass('next')) {
      return animate('next');
    } else {
      return animate('prev');
    }
  });
  return initialize();
};

name = 'superslides';

$.fn[name] = function(option, args) {
  var $this, data, method;
  if (typeof option === "string") {
    $this = $(this);
    data = $this.data(name);
    method = data[option];
    if (typeof method === 'function') {
      method = method.call($this, args);
    }
    return method;
  }
  return this.each(function() {
    var options;
    $this = $(this);
    data = $this.data(name);
    options = typeof option === 'object' && option;
    if (!data) {
      return $this.data(name, (data = new Superslides(this, options)));
    }
  });
};
