/*
 * profile.js — phần tương tác của trang profile.
 *
 * Cố ý KHÔNG dùng import/export: file này chạy bằng thẻ <script> thường nên
 * Nguyên tắc: JS chỉ đổi TRẠNG THÁI (aria-expanded, hidden, class modifier),
 * còn hiện cái gì ra là việc của CSS. Không set style trực tiếp trong JS.
 *
 * Dữ liệu ở đây là DỮ LIỆU GIẢ. Sau này class User / Repository render thật
 * thì thay chỗ MOCK_TOTALS và bỏ hàm nhân bản đi.
 */

(function () {
  'use strict';

  // Năm đang hiển thị sẵn trong HTML. Mọi năm khác được nhân bản từ năm này.
  var TEMPLATE_YEAR = '2026';

  // Tổng số contribution giả cho từng năm.
  var MOCK_TOTALS = {
    2026: '1,847',
    2025: '2,134',
    2024: '1,592',
    2023: '968',
    2022: '431',
    2021: '117'
  };

  var activityList = document.querySelector('.contribution-activity__list');
  var showMoreButton = document.querySelector('.contribution-activity__expand-icon');
  var countHeading = document.querySelector('.contribution-graph__count');

  // Chụp lại HTML gốc của năm 2026 NGAY khi tải trang, trước khi có ai bấm gì.
  // Đây là bản mẫu để nhân ra các năm còn lại.
  var activityTemplate = activityList ? activityList.innerHTML : '';

  /* --------------------------------------------------------------------
   * Uỷ quyền sự kiện (event delegation)
   *
   * Gắn MỘT listener lên document thay vì gắn cho từng nút. Lý do: khi đổi
   * năm, toàn bộ activity bị vẽ lại — nếu gắn trực tiếp lên từng nút thì
   * các nút mới sẽ không có listener, bấm không ăn. Nghe ở document thì nút
   * sinh ra lúc nào cũng chạy được.
   * ------------------------------------------------------------------ */
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var foldButton = target.closest('.activity-item__expand-btn');
    if (foldButton) {
      toggleActivityItem(foldButton);
      return;
    }

    if (showMoreButton && target.closest('.contribution-activity__expand-icon')) {
      revealNextPeriod();
      return;
    }

    var yearLink = target.closest('.year-selector__item');
    if (yearLink) {
      event.preventDefault();
      switchYear(yearLink);
    }
  });

  /* ---- Gập / mở một mục activity ------------------------------------- */
  function toggleActivityItem(button) {
    var item = button.closest('.activity-item');
    if (!item) return;

    var content = item.querySelector('.activity-item__content');
    if (!content) return;

    // aria-expanded là chuỗi "true"/"false", không phải boolean.
    var isOpen = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    content.hidden = isOpen;
  }

  /* ---- Show more activity: mở thêm một khối tháng --------------------- */
  function revealNextPeriod() {
    var periods = getPeriods();
    var next = null;

    periods.forEach(function (period) {
      if (!next && period.hidden) next = period;
    });

    if (next) next.hidden = false;

    // Hết khối để mở thì ẩn nút đi, không để nút bấm mà không có gì xảy ra.
    var stillHidden = periods.filter(function (period) {
      return period.hidden;
    });

    if (stillHidden.length === 0 && showMoreButton) {
      showMoreButton.hidden = true;
    }
  }

  function getPeriods() {
    if (!activityList) return [];
    return Array.prototype.slice.call(
      activityList.querySelectorAll('.contribution-activity__period')
    );
  }

  /* ---- Đổi năm -------------------------------------------------------- */
  function switchYear(link) {
    var year = link.getAttribute('data-year');
    if (!year) return;

    // 1. Chuyển modifier --active sang mục vừa bấm.
    var items = document.querySelectorAll('.year-selector__item');
    Array.prototype.forEach.call(items, function (item) {
      var isPicked = item === link;
      item.classList.toggle('year-selector__item--active', isPicked);
      if (isPicked) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });

    // 2. Đổi dòng tiêu đề của biểu đồ.
    if (countHeading) {
      var total = MOCK_TOTALS[year] || '0';
      countHeading.textContent =
        year === TEMPLATE_YEAR
          ? total + ' contributions in the last year'
          : total + ' contributions in ' + year;
    }

    // 3. Vẽ lại danh sách activity.
    //    Nhân bản HTML của năm mẫu rồi thay số năm trong tiêu đề tháng.
    //    Đây là dữ liệu giả cho chạy được tab, chưa phải dữ liệu thật.
    if (activityList) {
      activityList.innerHTML = activityTemplate.split(TEMPLATE_YEAR).join(year);

      // Vẽ lại thì phải trả trạng thái về ban đầu: chỉ hiện khối tháng đầu.
      getPeriods().forEach(function (period, index) {
        period.hidden = index !== 0;
      });
      if (showMoreButton) showMoreButton.hidden = false;
    }

    // 4. Xáo lại độ đậm nhạt của lịch cho mỗi năm một dáng khác nhau.
    repaintCalendar(year);
  }

  /* ---- Tô lại lịch contribution --------------------------------------
   * Dùng công thức sinh số giả ngẫu nhiên có HẠT GIỐNG là số năm, nên cùng
   * một năm luôn ra đúng một hình — bấm qua bấm lại không nhảy lung tung.
   * ------------------------------------------------------------------ */
  function repaintCalendar(year) {
    var cells = document.querySelectorAll('.contribution-graph__calendar .contribution-graph__cell');
    if (!cells.length) return;

    var seed = Number(year) || 1;

    Array.prototype.forEach.call(cells, function (cell, index) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      var level = Math.floor((seed / 2147483648) * 5);

      for (var i = 0; i < 5; i += 1) {
        cell.classList.remove('contribution-graph__cell--l' + i);
      }
      cell.classList.add('contribution-graph__cell--l' + level);
    });
  }

  // Đồng bộ lịch mặc định với cùng thuật toán dùng khi chọn năm.
  var activeYearLink = document.querySelector('.year-selector__item--active');
  repaintCalendar(
    activeYearLink ? activeYearLink.getAttribute('data-year') : TEMPLATE_YEAR
  );
})();

/* --------------------------------------------------------------------
 * Load profile từ localStorage.
 * - Login đã lưu `currentUser` (full record user.txt).
 * - Rỗng / lỗi parse → redirect về login.html.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  var raw = localStorage.getItem('currentUser');
  if (!raw) {
    window.location.href = 'login.html';
    return;
  }

  var record;
  try {
    record = JSON.parse(raw);
  } catch (error) {
    window.location.href = 'login.html';
    return;
  }

  var user = new User(record.userId, record.accountId, record.displayName, record);

  function setText(selector, value) {
    var el = document.querySelector(selector);
    if (el) {
      el.textContent = value == null ? '' : value;
    }
  }

  function setOptionalText(selector, value) {
    var el = document.querySelector(selector);
    if (!el) return;
    var hasValue = value !== null && value !== undefined && String(value).trim() !== '';
    el.textContent = hasValue ? value : '';
    el.hidden = !hasValue;
  }

  setText('[data-profile="name"]', user.displayName);
  setText('[data-profile="username"]', user.username);
  setText('[data-profile="pronouns"]', user.pronouns ? ' · ' + user.pronouns : '');
  setText('.header__username', user.username);
  setOptionalText('[data-profile="bio"]', user.bio);

  var usernameRow = document.querySelector('[data-profile-row="username"]');
  if (usernameRow) usernameRow.hidden = !user.username && !user.pronouns;

  var titleName = user.username || user.displayName || 'Profile';
  document.title = titleName + (user.displayName && user.displayName !== titleName
    ? ' (' + user.displayName + ')'
    : '') + ' · GitHub';

  var avatars = document.querySelectorAll('.sidebar__avatar, .header__user-avatar');
  Array.prototype.forEach.call(avatars, function (avatar) {
    avatar.alt = user.displayName || user.username || 'User avatar';
    if (user.avatarUrl) {
      var avatarUrl = user.avatarUrl;
      if (avatarUrl.indexOf('assets/') === 0) avatarUrl = '../' + avatarUrl;
      avatar.src = avatarUrl;
    }
  });

  var timeText = user.localTime || user.timezone
    ? (user.localTime || '') + (user.localTime && user.timezone ? ' · ' : '') + (user.timezone || '')
    : '';

  // followers / following
  var counts = document.querySelectorAll('.sidebar__follow-count');
  if (counts.length >= 2) {
    counts[0].textContent = user.followersCount;
    counts[1].textContent = user.followingCount;
  }

  // social accounts → 4 link-icon sẵn; icon theo hostname
  var ICONS = {
    github: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"/></svg>',
    facebook: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.3 15.4" role="img" aria-labelledby="apw6myvxrcyzkavro5togxdze9mw8mmm" class="octicon" width="16" height="16"><title id="apw6myvxrcyzkavro5togxdze9mw8mmm">Facebook</title><path d="M14.5 0H.8a.88.88 0 0 0-.8.9v13.6a.88.88 0 0 0 .8.9h7.3v-6h-2V7.1h2V5.4a2.87 2.87 0 0 1 2.5-3.1h.5a10.87 10.87 0 0 1 1.8.1v2.1h-1.3c-1 0-1.1.5-1.1 1.1v1.5h2.3l-.3 2.3h-2v5.9h3.9a.88.88 0 0 0 .9-.8V.8a.86.86 0 0 0-.8-.8z" fill="currentColor"></path></svg>',
    instagram: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 0C5.83 0 5.56.01 4.7.05 3.84.09 3.26.22 2.75.44c-.52.2-.95.48-1.38.9-.43.43-.71.86-.9 1.38-.22.51-.35 1.09-.39 1.95C.01 5.56 0 5.83 0 8s.01 2.44.05 3.3c.04.86.17 1.44.39 1.95.19.52.47.95.9 1.38.43.43.86.71 1.38.9.51.22 1.09.35 1.95.39.86.04 1.13.05 3.3.05s2.44-.01 3.3-.05c.86-.04 1.44-.17 1.95-.39.52-.19.95-.47 1.38-.9.43-.43.71-.86.9-1.38.22-.51.35-1.09.39-1.95.04-.86.05-1.13.05-3.3s-.01-2.44-.05-3.3c-.04-.86-.17-1.44-.39-1.95a3.8 3.8 0 0 0-.9-1.38 3.8 3.8 0 0 0-1.38-.9c-.51-.22-1.09-.35-1.95-.39C10.44.01 10.17 0 8 0Zm0 1.44c2.14 0 2.39.01 3.24.05.78.04 1.2.17 1.49.28.37.14.64.31.92.59.28.28.45.55.59.92.11.29.24.71.28 1.49.04.85.05 1.1.05 3.24s-.01 2.39-.05 3.24c-.04.78-.17 1.2-.28 1.49-.14.37-.31.64-.59.92-.28.28-.55.45-.92.59-.29.11-.71.24-1.49.28-.85.04-1.1.05-3.24.05s-2.39-.01-3.24-.05c-.78-.04-1.2-.17-1.49-.28a2.5 2.5 0 0 1-.92-.59 2.5 2.5 0 0 1-.59-.92c-.11-.29-.24-.71-.28-1.49-.04-.85-.05-1.1-.05-3.24s.01-2.39.05-3.24c.04-.78.17-1.2.28-1.49.14-.37.31-.64.59-.92.28-.28.55-.45.92-.59.29-.11.71-.24 1.49-.28.85-.04 1.1-.05 3.24-.05Zm0 2.68a3.88 3.88 0 1 0 0 7.76 3.88 3.88 0 0 0 0-7.76Zm0 6.4a2.52 2.52 0 1 1 0-5.04 2.52 2.52 0 0 1 0 5.04Zm4.96-6.55a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z"/></svg>',
    link: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Zm-1.55 9.45a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 1 1-2.83-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 1 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25Z"/></svg>'
  };

  var PROFILE_ICONS = {
    company: '<svg data-component="Octicon" class="octicon octicon-organization" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"></path></svg>',
    location: '<svg data-component="Octicon" class="octicon octicon-location" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z"></path></svg>',
    time: '<svg data-component="Octicon" class="octicon octicon-clock" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path></svg>',
    website: ICONS.link
  };

  renderProfileLink('company', user.company);
  renderProfileLink('location', user.location);
  renderProfileLink('time', timeText);
  renderProfileLink('website', user.websiteUrl, user.websiteUrl);

  var socials = (user.socialAccounts || []).filter(function (url) {
    return typeof url === 'string' && url.trim() !== '';
  });
  var links = document.querySelectorAll('a.sidebar__link-icon[data-profile-link="social"]');
  for (var i = 0; i < links.length; i += 1) {
    if (i < socials.length) {
      renderSocial(links[i], socials[i]);
    } else {
      links[i].removeAttribute('href');
      links[i].innerHTML = '';
      links[i].hidden = true;
    }
  }

  function iconFor(url) {
    var host = (url || '').toLowerCase();
    if (host.indexOf('github') !== -1) return ICONS.github;
    if (host.indexOf('twitter') !== -1 || host.indexOf('x.com') !== -1) return ICONS.x;
    if (host.indexOf('facebook') !== -1) return ICONS.facebook;
    if (host.indexOf('instagram') !== -1) return ICONS.instagram;
    return ICONS.link;
  }

  function socialIdOf(url) {
    try {
      var parsed = new URL(url);
      var segments = parsed.pathname.split('/').filter(Boolean);
      return segments.length ? decodeURIComponent(segments[segments.length - 1]) : parsed.hostname;
    } catch (error) {
      return String(url || '').replace(/^https?:\/\//, '').replace(/\/$/, '').split('/').pop();
    }
  }

  function renderSocial(link, url) {
    link.href = url;
    link.innerHTML = iconFor(url) + '<span></span>';
    link.querySelector('span').textContent = socialIdOf(url);
    link.hidden = false;
  }

  function renderProfileLink(name, value, href) {
    var link = document.querySelector('[data-profile-link="' + name + '"]');
    if (!link || !value) return;
    if (href) link.href = href;
    link.innerHTML = PROFILE_ICONS[name] + '<span></span>';
    link.querySelector('span').textContent = value;
    link.hidden = false;
  }
})();
