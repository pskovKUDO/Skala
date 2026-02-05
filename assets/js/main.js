// Год в футере (если элемент существует): показываем диапазон 2025–Текущий год
var yearEl = document.getElementById('year');
if (yearEl) {
  var currentYear = new Date().getFullYear();
  yearEl.textContent = currentYear < 2025 ? 2025 : currentYear;
}

// Мобильное меню
var navToggle = document.querySelector('.nav-toggle');
var siteNav = document.querySelector('.site-nav');

// Функция закрытия меню (убираем дублирование)
function closeMobileMenu() {
  if (siteNav) siteNav.classList.remove('open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', function () {
    var isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Плавный скролл
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var targetId = this.getAttribute('href');
    if (!targetId || targetId === '#') return;
    var targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobileMenu();
    }
  });
});

// Специальный обработчик для кнопки "Наверх"
var toTopBtn = document.querySelector('.to-top');
if (toTopBtn) {
  toTopBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // закрыть меню на мобиле
    if (siteNav) siteNav.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  });
}

// Обработчик для логотипа - прокрутка наверх
var brandLogo = document.getElementById('scrollToTop');
if (brandLogo) {
  brandLogo.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // закрыть меню на мобиле
    if (siteNav) siteNav.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  });
}

// Простой лайтбокс для галереи с навигацией
(function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var lightboxImg = lightbox.querySelector('.lightbox-image');
  var lightboxCaption = lightbox.querySelector('.lightbox-caption');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var prevBtn = lightbox.querySelector('.lightbox-prev');
  var nextBtn = lightbox.querySelector('.lightbox-next');
  
  var currentAlbum = null;
  var currentIndex = 0;
  var currentPhotos = [];
  
  function setNavVisible(visible) {
    if (prevBtn) prevBtn.style.display = visible ? '' : 'none';
    if (nextBtn) nextBtn.style.display = visible ? '' : 'none';
  }
  
  function openPhoto(index) {
    if (index < 0 || index >= currentPhotos.length) return;
    currentIndex = index;
    var photo = currentPhotos[index];
    lightboxImg.src = photo.href;
    if (lightboxCaption) lightboxCaption.textContent = photo.caption || '';
  }
  
  function showPrev() {
    if (!currentPhotos.length) return;
    var nextIndex = currentIndex - 1;
    if (nextIndex < 0) nextIndex = currentPhotos.length - 1; // циклическая навигация
    openPhoto(nextIndex);
  }
  
  function showNext() {
    if (!currentPhotos.length) return;
    var nextIndex = currentIndex + 1;
    if (nextIndex >= currentPhotos.length) nextIndex = 0; // циклическая навигация
    openPhoto(nextIndex);
  }
  
  // Обработчики для кнопок навигации
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  
  // Навигация с клавиатуры
  document.addEventListener('keydown', function(e) {
    if (lightbox.hidden) return;
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
  
  // Свайп для мобильных устройств
  var touchStartX = 0;
  var touchEndX = 0;
  var minSwipeDistance = 50; // минимальная дистанция для свайпа
  
  lightbox.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  lightbox.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    var swipeDistance = touchStartX - touchEndX;
    
    // Свайп влево (следующее фото)
    if (swipeDistance > minSwipeDistance) {
      showNext();
    }
    // Свайп вправо (предыдущее фото)
    else if (swipeDistance < -minSwipeDistance) {
      showPrev();
    }
    
    // Сброс значений
    touchStartX = 0;
    touchEndX = 0;
  }
  
  // Обработчик для обложек альбомов - открывает первую фотографию альбома
  document.querySelectorAll('[data-album-gallery]').forEach(function (cover) {
    cover.addEventListener('click', function (e) {
      e.preventDefault();
      var albumName = cover.getAttribute('data-album-gallery');
      var gallery = document.querySelector('[data-album="' + albumName + '"]');
      if (gallery) {
        currentPhotos = Array.prototype.slice.call(gallery.querySelectorAll('a')).map(function(a) {
          return { href: a.getAttribute('href'), caption: a.getAttribute('data-caption') };
        });
        currentAlbum = albumName;
        currentIndex = 0;
        if (currentPhotos.length > 0) {
          openPhoto(0);
          lightbox.hidden = false;
          document.body.style.overflow = 'hidden';
          setNavVisible(true);
        }
      }
    });
  });

  document.querySelectorAll('[data-gallery] a').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var gallery = item.closest('[data-gallery]');
      if (gallery) {
        var album = gallery.getAttribute('data-album');
        if (album) {
          // Если это альбом, загружаем все фото
          currentPhotos = Array.prototype.slice.call(gallery.querySelectorAll('a')).map(function(a) {
            return { href: a.getAttribute('href'), caption: a.getAttribute('data-caption') };
          });
          currentAlbum = album;
          var href = item.getAttribute('href');
          currentIndex = currentPhotos.findIndex(function(p) { return p.href === href; });
          if (currentIndex === -1) currentIndex = 0;
          setNavVisible(true);
        } else {
          // Иначе просто показываем фото
          var href = item.getAttribute('href');
          if (href) {
            lightboxImg.src = href;
            if (lightboxCaption) lightboxCaption.textContent = item.getAttribute('data-caption') || '';
            lightbox.hidden = false;
            document.body.style.overflow = 'hidden';
            // для одиночных фото оставляем стрелки видимыми по умолчанию
          }
        }
      }
    });
  });

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    if (lightboxCaption) lightboxCaption.textContent = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
})();

// Умный календарь соревнований: прошедшие (с годом) сверху, будущие ниже, ближайшее помечено
(function () {
  var eventsTable = document.querySelector('#events .table tbody');
  if (!eventsTable) return;
  var eventsScroll = document.querySelector('#events .events-scroll');
  var emptyEl = document.getElementById('events-empty');

  var monthMap = {
    'янв.': 1, 'фев.': 2, 'мар.': 3, 'апр.': 4, 'май.': 5, 'мая': 5,
    'июн.': 6, 'июл.': 7, 'авг.': 8,
    'сент.': 9, 'окт.': 10, 'нояб.': 11, 'дек.': 12,
    'января': 1, 'февраля': 2, 'марта': 3, 'апреля': 4,
    'июня': 6, 'июля': 7, 'августа': 8,
    'сентября': 9, 'октября': 10, 'ноября': 11, 'декабря': 12
  };
  var today = new Date();
  // нормализуем "сегодня" до полуночи
  var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  var parseDate = function (text) {
    // примеры: "20–21 сент.", "6–7 дек.", "12–15 декабря", "21–22 фев."
    var m = text.trim().match(/(\d{1,2})(?:[–-]\d{1,2})?\s*(янв\.|фев\.|мар\.|апр\.|май\.|мая|июн\.|июл\.|авг\.|сент\.|окт\.|нояб\.|дек\.|января|февраля|марта|апреля|июня|июля|августа|сентября|октября|ноября|декабря)/i);
    if (!m) return null;
    var day = parseInt(m[1], 10);
    var monthKey = m[2].toLowerCase();
    var month = monthMap[monthKey];
    if (!month) return null;
    var currentYear = today.getFullYear();
    var todayMonth = today.getMonth() + 1; // 1-12
    var yearGuess = currentYear;
    // Если сейчас январь–февраль, а месяц события с сентября по декабрь — считаем, что это прошлый год (учебный сезон)
    if (todayMonth <= 2 && month >= 9) {
      yearGuess = currentYear - 1;
    }
    var dt = new Date(yearGuess, month - 1, day);
    // Для остальных случаев (конец календарного года) — сдвиг вперёд только если год не был принудительно уменьшен
    if (yearGuess === currentYear && dt < todayStart && (todayStart - dt) / 86400000 > 15) {
      dt.setFullYear(currentYear + 1);
    }
    return dt;
  };

  var rows = Array.prototype.slice.call(eventsTable.querySelectorAll('tr'));
  var parsed = rows
    .map(function (tr) {
      var dateCell = tr.cells[0];
      var dateText = dateCell ? dateCell.textContent : '';
      var when = parseDate(dateText);
      if (!when) return null;
      return {
        tr: tr,
        when: when,
        dateCell: dateCell
      };
    })
    .filter(Boolean);

  if (!parsed.length) return;

  // Делим на прошедшие и будущие
  var past = [];
  var upcoming = [];
  parsed.forEach(function (item) {
    if (item.when < todayStart) past.push(item);
    else upcoming.push(item);
  });

  // Если нет будущих соревнований — показываем заглушку вместо списка
  if (!upcoming.length) {
    if (eventsScroll) eventsScroll.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
  } else {
    if (eventsScroll) eventsScroll.style.display = '';
    if (emptyEl) emptyEl.style.display = 'none';
  }

  // Сортируем: прошедшие — от самых ранних (сентябрь) к более поздним, будущие — от ближайших к дальним
  past.sort(function (a, b) { return a.when - b.when; });
  upcoming.sort(function (a, b) { return a.when - b.when; });

  // Перестраиваем таблицу и проставляем классы/годы
  eventsTable.innerHTML = '';
  var currentYear = todayStart.getFullYear();

  // Сначала прошедшие
  past.forEach(function (item) {
    item.tr.classList.remove('next-event', 'past-event');
    item.tr.classList.add('past-event');

    var year = item.when.getFullYear();
    if (item.dateCell && year !== currentYear && !/\d{4}/.test(item.dateCell.textContent)) {
      var baseText = item.dateCell.textContent.trim().replace(/\s+\d{4}$/, '');
      item.dateCell.innerHTML = baseText + '<br><span class="event-year">' + year + '</span>';
    }

    eventsTable.appendChild(item.tr);
  });

  // Затем будущие, первая из них — "Ближайшее"
  var firstUpcomingRow = null;
  upcoming.forEach(function (item, index) {
    item.tr.classList.remove('next-event', 'past-event');
    if (index === 0) {
      item.tr.classList.add('next-event');
      firstUpcomingRow = item.tr;
    }

    var year = item.when.getFullYear();
    if (item.dateCell && year !== currentYear && !/\d{4}/.test(item.dateCell.textContent)) {
      var baseText = item.dateCell.textContent.trim().replace(/\s+\d{4}$/, '');
      item.dateCell.innerHTML = baseText + '<br><span class="event-year">' + year + '</span>';
    }

    eventsTable.appendChild(item.tr);
  });

  // При загрузке списка прокручиваем вертикальный контейнер так,
  // чтобы ближайшее соревнование было видно первым.
  if (firstUpcomingRow) {
    var scrollWrap = document.querySelector('#events .events-scroll .table-wrap');
    if (scrollWrap) {
      // Высота заголовка таблицы (фиксированный thead), чтобы не перекрывал строку
      var table = scrollWrap.querySelector('.table');
      var thead = table ? table.querySelector('thead') : null;
      var headerHeight = thead ? thead.offsetHeight : 0;

      // Смещаем так, чтобы строка "Ближайшее" была полностью видна под заголовком
      var offsetTop = firstUpcomingRow.offsetTop;
      var targetScroll = offsetTop - headerHeight - 8; // небольшой отступ сверху
      if (targetScroll < 0) targetScroll = 0;
      scrollWrap.scrollTop = targetScroll;
    }
  }
})();

// Вертикальные стрелки для прокрутки расписания соревнований
(function () {
  var wrap = document.querySelector('#events .events-scroll .table-wrap');
  if (!wrap) return;
  var btnUp = document.querySelector('#events .events-scroll-up');
  var btnDown = document.querySelector('#events .events-scroll-down');
  var step = 140; // шаг прокрутки по клику

  if (btnUp) {
    btnUp.addEventListener('click', function () {
      wrap.scrollBy({ top: -step, behavior: 'smooth' });
    });
  }
  if (btnDown) {
    btnDown.addEventListener('click', function () {
      wrap.scrollBy({ top: step, behavior: 'smooth' });
    });
  }
})();

// Открытие фото руководителя по клику на имени в hero
(function () {
  var coachName = document.querySelector('.hero .name');
  if (!coachName) return;
  coachName.style.cursor = 'pointer';

  coachName.addEventListener('click', function () {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    var lightboxImg = lightbox.querySelector('.lightbox-image');
    var lightboxCaption = lightbox.querySelector('.lightbox-caption');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');

    lightboxImg.src = 'foto/Ozyumenko_Viktor_Vladimirovich.jpg';
    lightboxImg.alt = 'Тренер Кудо Псков Озюменко Виктор Владимирович';
    if (lightboxCaption) lightboxCaption.textContent = 'Озюменко Виктор Владимирович, чёрный пояс, 3 дан';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  });
})();

// Добавление кружочков поясов к датам соревнований
(function () {
  var eventsTable = document.querySelector('#events .table tbody');
  if (!eventsTable) return;
  
  // Все 7 поясов (для "Все возраста") - с белым в начале
  var allBelts = [
    { class: 'belt-white', name: 'Белый' },
    { class: 'belt-purple', name: 'Фиолетовый' },
    { class: 'belt-dark-blue', name: 'Темно-синий' },
    { class: 'belt-yellow', name: 'Желтый' },
    { class: 'belt-teal', name: 'Бирюзовый' },
    { class: 'belt-brown', name: 'Коричневый' },
    { class: 'belt-black', name: 'Черный' }
  ];
  
  // 4 пояса (для "12 лет и старше")
  var seniorBelts = [
    { class: 'belt-yellow', name: 'Желтый' },
    { class: 'belt-teal', name: 'Бирюзовый' },
    { class: 'belt-brown', name: 'Коричневый' },
    { class: 'belt-black', name: 'Черный' }
  ];
  
  var rows = eventsTable.querySelectorAll('tr');
  rows.forEach(function (row) {
    var tournamentCell = row.cells[1]; // Ячейка с названием турнира
    var ageCell = row.cells[3];
    
    if (!tournamentCell || !ageCell) return;
    
    // Проверим, нет ли уже кружочков
    if (tournamentCell.querySelector('.belt-indicators')) return;
    
    var ageText = ageCell.textContent.trim();
    var beltsToShow = [];
    
    // Определяем набор поясов по возрасту
    if (ageText === 'Все возраста') {
      beltsToShow = allBelts;
    } else if ((ageText.includes('12 лет и старше') || ageText.includes('12+')) && !ageText.includes(',')) {
      // Возраст 12+ без перечислений через запятую - 4 пояса
      beltsToShow = seniorBelts;
    } else if (ageText.includes(',') || ageText.includes('Фестиваль') || (ageText.includes('и') && !ageText.includes('12 лет и старше'))) {
      // Если есть запятая, упоминание фестиваля или союз "и" (кроме "12 лет и старше") - все пояса
      beltsToShow = allBelts;
    } else if (ageText.includes('18') || ageText.includes('21')) {
      // Для взрослых также 4 пояса (если нет запятых и фестиваля)
      beltsToShow = seniorBelts;
    } else {
      // По умолчанию все пояса
      beltsToShow = allBelts;
    }
    
    // Добавим кружочки поясов под название турнира
    var beltContainer = document.createElement('div');
    beltContainer.className = 'belt-indicators';
    beltContainer.setAttribute('aria-label', 'Пояса: ' + beltsToShow.map(function(b) { return b.name; }).join(', '));
    
    beltsToShow.forEach(function (belt) {
      var circle = document.createElement('span');
      circle.className = 'belt-circle ' + belt.class;
      circle.setAttribute('title', belt.name);
      beltContainer.appendChild(circle);
    });
    
    // Добавим после текста турнира
    tournamentCell.appendChild(document.createElement('br'));
    tournamentCell.appendChild(beltContainer);
  });
})();

// Открытие фото пояса по клику на "чёрный пояс, 3 дан"
(function(){
  var belt = document.querySelector('.belt-link');
  if (!belt) return;
  belt.addEventListener('click', function(){
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    var lightboxImg = lightbox.querySelector('.lightbox-image');
    var lightboxCaption = lightbox.querySelector('.lightbox-caption');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    lightboxImg.src = 'foto/poyas_kudo.jpeg';
    lightboxImg.alt = 'Чёрный пояс Кудо, 3 дан';
    if (lightboxCaption) lightboxCaption.textContent = 'Чёрный пояс, 3 дан';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  });
})();


