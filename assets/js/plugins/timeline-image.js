$(function() {
  $('.timeline-content', '.timeline').each(function(i, el) {
    if (i % 2 == 0) {
      $(el).addClass('js--fadeInLeft');
    } else {
      $(el).addClass('js--fadeInRight');
    }
  });

  window.sr = ScrollReveal();

  if ($(window).width() < 768) {
    if ($('.timeline-content').hasClass('js--fadeInLeft')) {
      $('.timeline-content')
          .removeClass('js--fadeInLeft')
          .addClass('js--fadeInRight');
    }

    sr.reveal('.js--fadeInRight', {
      origin: 'right',
      distance: '300px',
      easing: 'ease-in-out',
      duration: 800,
    });

  } else {
    sr.reveal('.js--fadeInLeft', {
      origin: 'left',
      distance: '300px',
      easing: 'ease-in-out',
      duration: 800,
    });

    sr.reveal('.js--fadeInRight', {
      origin: 'right',
      distance: '300px',
      easing: 'ease-in-out',
      duration: 800,
    });
  }

  sr.reveal('.js--fadeInLeft', {
    origin: 'left',
    distance: '300px',
    easing: 'ease-in-out',
    duration: 800,
  });

  sr.reveal('.js--fadeInRight', {
    origin: 'right',
    distance: '300px',
    easing: 'ease-in-out',
    duration: 800,
  });
});