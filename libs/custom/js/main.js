/* jshint browser: true */
$(document).ready(function () {
  // Variables
  var $codeSnippets = $('.code-example-body'),
    $body = $('body'),
    $window = $(window),
    $popoverLink = $('[data-popover]'),
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
    $popoverLink.on('click', openPopover)
    $document.on('click', closePopover)
    $('a[href^="#"]').on('click', smoothScroll);
    $('.people-prof-ic').on('click', function() {
      this.classList.toggle('flipped');
    });
    cluster = setInterval(function () {
      $("#clustrmaps-widget-v2").css("display", "none");
      // console.log("hide  clustrmaps-widget-v2");
    }, 1000);
    setTimeout(function () {
      clearInterval(cluster);
    }, 10000);

    
    buildSnippets();
    makeExternalLinkOnBlank();
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

function makeExternalLinkOnBlank() {
  var links = document.querySelectorAll('a.common-link[href^="http"]');
  links.forEach(link => {
    link.setAttribute('target', '_blank');
  });
}

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

  // console.log(x,y) // toast location

  setTimeout(function () {
    toast.remove();
  }, 2000);
}

function highlightNavbar() {
  $navList = $('.navbar-links');
  var currentUrl = $(location).attr('href');
  var navId = currentUrl.split("/").pop().split(".")[0];
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
  const defaultLang = 'en';
  // const defaultLang = allowLangs.includes(browserLang) ? browserLang : 'en';
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

// deprecated
function switchLang(lang) {
  // localStorage.setItem('userLang', lang);
  applyTranslations(translations[lang]);
  applyLangOnTeam(lang);
  lastLang = lang;
}

function applyLangViaBrowser() {
  const lang = getLang();
  loadLanguage(lang).then(() => {
    applyTranslations(translations[lang]);
  });
  document.documentElement.setAttribute('lang-loaded', 'true');
  document.documentElement.setAttribute('lang', lang);
}

function initI18n() {
  applyLangViaBrowser();
}