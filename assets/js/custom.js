$(document).ready(function() {
    // Aplica efecto fadeIn al cargar la web
    $('.showOnReady').each(function(i) {
      $(this).animate({opacity: '1'}, 1500);
    });
  
    // Deshabilita el autoplay para smartphones
    if (/Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i
            .test(navigator.userAgent)) {
      $('video').removeAttr('autoplay');
      $('video:not(.home-video)').attr('controls', 'controls');
    } else {
      $('video').attr('autoplay');
    }
  
    // Aplica efecto fadeIn al hacer scroll o al cargar la web con un scroll
    // predefinido
    $(window).scroll(function() {
      $('.showOnScroll').each(function(i) {
        var bottom_of_object = $(this).position().top + $(this).outerHeight();
        var bottom_of_window = $(window).scrollTop() + $(window).height() - 50;
  
        if (bottom_of_window > bottom_of_object) {
          $(this).animate({opacity: '1'}, 1500);
        }
      });
    });
    $('.showOnScroll').each(function(i) {
      var bottom_of_object = $(this).position().top + $(this).outerHeight();
      var bottom_of_window = $(window).scrollTop() + $(window).height() - 50;
  
      if (bottom_of_window > bottom_of_object) {
        $(this).animate({opacity: '1'}, 1500);
      }
    });
  

    // Preloader
    setTimeout(function() {
      $('.preloader').fadeOut(500);
    }, 1500)
  });
  