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
  let isScrolling;

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
    var target = this.hash,
    $target = $(target);
    $('html, body').stop().animate({
      'scrollTop': $target.offset().top - 40
    }, 0, 'swing', function () {
      window.location.hash = target;
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
    onScroll();
  }

  function makeNavbarSticky() {
    const windowY = window.scrollY;
    if (navOffsetTop < windowY && !$body.hasClass('has-docked-nav')) {
      $body.addClass('has-docked-nav');
      // $nav.width($(".spacer").width());
    }
    if (navOffsetTop > windowY && $body.hasClass('has-docked-nav')) {
      $body.removeClass('has-docked-nav')
    }
  }
  
  function onScroll() {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(function () {
      makeNavbarSticky();
    }, 100);
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

  $('.bibtex').on('click', function(event){
    const text = $(this).data('bib');
    if (window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Bib copied!', event.clientX, event.clientY);
      }).catch(function (err) {
        // nothing todo
      });
    } else {
      unsecuredCopyToClipboard(text, event.clientX, event.clientY);
      showToast('Bib copied!', event.clientX, event.clientY);
    }
  });

  setInterval(highlightNavbar, 250);
  // setInterval(makeNavbarSticky, 10000);
  initI18n();
});

function unsecuredCopyToClipboard(text, x, y) {
  // var copyArea = $('<div id="copyArea">' + '</div>');
  // copyArea.text(text).css({
  //   left: x + 'px',
  //   top: y + 'px'
  // });
  // $('body').append(copyArea);
  // copyArea.focus();
  // copyArea.select();
  // document.execCommand('copy');
  // setTimeout(function () {
  //   copyArea.remove();
  // }, 200);

  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  // textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Unable to copy to clipboard', err);
  }
  document.body.removeChild(textArea);
}

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

function highlightNavbar() {
  $navList = $('.navbar-links');
  var currentUrl = $(location).attr('href');
  var navId = currentUrl.split("/").pop().split(".")[0];
  if (navId === "") {
    navId = "about";
  }
  if ($navList.data('active') !== navId) {
    // change
    $('#'+$navList.data('active')).removeClass("active-navbar-link");
    $("#nav-"+navId).addClass("active-navbar-link");
    $navList.data('active', navId);
  }
}

let translations = {};
const allowLangs = ['en', 'zh'];
let lastLang = "en";

function getLang() {
  // const savedLang = localStorage.getItem('userLang');
  const browserLang = navigator.language.split('-')[0];
  const defaultLang = allowLangs.includes(browserLang) ? browserLang : 'en';
  // return savedLang || defaultLang;
  return defaultLang;
}

function loadAllLanguages() {
  return Promise.all(allowLangs.map(lang => loadLanguage(lang)));
}

async function loadLanguage(lang) {
  try {
    const response = await fetch(`/locales/${lang}.json`);
    translations[lang] = await response.json();
  } catch (error) {
    console.error('Error loading language file:', error);
  }
}


function applyTranslations(langDict) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    try {
      const translation = langDict[key];
      element.innerHTML = translation;
    } catch (error) {
      console.error(`Error translating element when key=${key}:`, element, error);
    }
  });
}

function applyLangOnTeam(lang) {
  $(`#grid-people-${lastLang}`).css("display", "none")
  $(`#grid-people-${lang}`).css("display", "grid")
}

function switchLang(lang) {
  // localStorage.setItem('userLang', lang);
  applyTranslations(translations[lang]);
  applyLangOnTeam(lang);
  lastLang = lang;
}

function initI18n() {
  const langSwitch = document.getElementById('langSwitcher');
  document.documentElement.removeAttribute('lang-loaded');
  loadAllLanguages().then(() => {
    const currentLang = getLang();
    lastLang = currentLang;
    switchLang(currentLang);
    langSwitch.value = currentLang;
    document.documentElement.setAttribute('lang-loaded', 'true');

    langSwitch.addEventListener('change', (e) => {
      const newLang = e.target.value;
      switchLang(newLang);
    });
  })
}