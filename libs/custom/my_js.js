/* jshint browser: true */
$(document).ready(function () {

  // Variables
  var $codeSnippets = $('.code-example-body'),
    // $nav = $('.navbar'),
    $nav = $('.navbar-mod'),
    $body = $('body'),
    $window = $(window),
    $popoverLink = $('[data-popover]'),
    navOffsetTop = $nav.offset().top,
    $document = $(document),
    entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
    }

  function init() {
    $window.on('scroll', onScroll)
    $window.on('resize', resize)
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
    $('a[href^="#"]').on('click', smoothScroll)
    buildSnippets();
    onScroll();
  }

  function smoothScroll(e) {
    e.preventDefault();
    $(document).off("scroll");
    var target = this.hash,
      menu = target;
    $target = $(target);
    $('html, body').stop().animate({
      'scrollTop': $target.offset().top - 40
    }, 0, 'swing', function () {
      window.location.hash = target;
      $(document).on("scroll", onScroll);
    });
  }

  function openPopover(e) {
    e.preventDefault()
    closePopover();
    var popover = $($(this).data('popover'));
    popover.toggleClass('open')
    e.stopImmediatePropagation();
  }

  function closePopover(e) {
    if ($('.popover.open').length > 0) {
      $('.popover').removeClass('open')
    }
  }

  $("#button").click(function () {
    $('html, body').animate({
      scrollTop: $("#elementtoScrollToID").offset().top
    }, 2000);
  });

  function resize() {
    $body.removeClass('has-docked-nav')
    navOffsetTop = $nav.offset().top
    onScroll()
  }
  
  function onScroll() {
    if (navOffsetTop < $window.scrollTop() && !$body.hasClass('has-docked-nav')) {
      $body.addClass('has-docked-nav');
      $nav.width($(".spacer").width());
    }
    if (navOffsetTop > $window.scrollTop() && $body.hasClass('has-docked-nav')) {
      $body.removeClass('has-docked-nav')
    }
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function buildSnippets() {
    $codeSnippets.each(function () {
      var newContent = escapeHtml($(this).html())
      $(this).html(newContent)
    })
  }


  init();

  function activeInit() {
    // deprecated
    $('#papers-recent').addClass("active");
    $('[data-ref="#papers-recent"]').addClass("active");
  }

  $('.bibtex').on('click', function(event){
    const text = $(this).data('bib');
    navigator.clipboard.writeText(text).then(function () {
      showToast('Bib copied!', event.clientX, event.clientY);
    }).catch(function (err) {
      // nothing todo
    });
  });
});


function showToast(text, x, y) {
  var toast = $('<div id="toast" class="show">' + text + '</div>');
  toast.text(text)
      .css({
        left: x + 'px',
        top: y + 'px'
      });

  $('body').append(toast);

  console.log(x,y)

  setTimeout(function () {
    toast.remove();
  }, 2000);
}