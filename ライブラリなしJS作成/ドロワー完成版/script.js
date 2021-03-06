(function () {
  // ボタンと本体
  const openButton = document.querySelector('.js-openDrawer');
  const drawer = document.querySelector('.js-drawer');
  const closeButton = drawer.querySelector('.js-closeDrawer');
  const backdrop = drawer.querySelector('.js-backdrop');

  const rootElement = document.documentElement;
  const scrollLockModifier = 'is-drawerOpen';

  const scrollbarFixTargets = document.querySelectorAll('.js-scrollbarFix');
  let scrollbarFix = false;

  const scrollableTarget = drawer.querySelector('.js-scrollable');

  let touchY = null;

  // 現在の状態（開いていたらtrue）
  let drawerOpen = false;

  const tabbableElements = drawer.querySelectorAll('a[href], button');
  const firstTabbable = tabbableElements[0];
  const lastTabbable = tabbableElements[tabbableElements.length - 1];

  // stateは真偽値
  function changeAriaExpanded(state) {
    const value = state ? 'true' : 'false';
    drawer.setAttribute('aria-expanded', value);
    openButton.setAttribute('aria-expanded', value);
    closeButton.setAttribute('aria-expanded', value);
  }

  // stateは真偽値
  function changeState(state) {
    if (state === drawerOpen) {
      console.log('2回以上連続で同じ状態に変更しようとしました');
      return;
    }
    changeAriaExpanded(state);
    drawerOpen = state;
  }

  function openDrawer() {
    changeState(true);
  }

  function closeDrawer() {
    changeState(false);
  }

  function onClickOpenButton() {
    activateScrollLock();
    openDrawer();
    firstTabbable.focus();
  }

  function onClickCloseButton() {
    closeDrawer();
  }

  function activateScrollLock() {
    addScrollbarWidth();
    rootElement.classList.add(scrollLockModifier);
  }

  function deactivateScrollLock() {
    removeScrollbarWidth();
    rootElement.classList.remove(scrollLockModifier);
  }

  function onTransitionendDrawer(event) {
    if (event.target !== drawer || event.propertyName !== 'visibility') {
      return;
    }
    if (!drawerOpen) {
      deactivateScrollLock();
      openButton.focus();
    }
  }

  // valueは文字列
  function addScrollbarMargin(value) {
    const targetsLength = scrollbarFixTargets.length;
    for (let i = 0; i < targetsLength; i++) {
      scrollbarFixTargets[i].style.marginRight = value;
    }
  }

  function addScrollbarWidth() {
    const scrollbarWidth = window.innerWidth - rootElement.clientWidth;
    if (!scrollbarWidth) {
      scrollbarFix = false;
      return;
    }
    const value = scrollbarWidth + 'px';
    addScrollbarMargin(value);
    scrollbarFix = true;
  }

  function removeScrollbarWidth() {
    if (!scrollbarFix) {
      return;
    }
    addScrollbarMargin('');
  }

  function onTouchStart(event) {
    if (event.targetTouches.length > 1) {
      return;
    }
    touchY = event.targetTouches[0].clientY;
  }

  function onTouchMove(event) {
    if (event.targetTouches.length > 1) {
      return;
    }
    // touchstart時と現在の差分から、スクロール方向を得る
    // 正：上方向へスクロール
    // 負：下方向へスクロール
    const touchMoveDiff = event.targetTouches[0].clientY - touchY;

    if (scrollableTarget.scrollTop === 0 && touchMoveDiff > 0) {
      event.preventDefault();
      return;
    }

    if (targetTotallyScrolled(scrollableTarget) && touchMoveDiff < 0) {
      event.preventDefault();
    }
  }

  function targetTotallyScrolled(element) {
    return element.scrollHeight - element.scrollTop <= element.clientHeight;
  }

  function onTouchMoveBackdrop(event) {
    if (event.targetTouches.length > 1) {
      return;
    }
    event.preventDefault();
  }

  function onKeydownTabKeyFirstTabbable(event) {
    if (event.key !== 'Tab' || !event.shiftKey) {
      return;
    }
    event.preventDefault();
    lastTabbable.focus();
  }

  function onKeydownTabKeyLastTabbable(event) {
    if (event.key !== 'Tab' || event.shiftKey) {
      return;
    }
    event.preventDefault();
    firstTabbable.focus();
  }

  function onKeydownEsc(event) {
    if (!drawerOpen || event.key !== 'Escape') {
      return;
    }
    event.preventDefault();
    closeDrawer();
  }

  // ドロワー内アニメーション（ドロワー本体、aria-expandの秒数はcssで調整）
  const animateDrawer = $('.js-animateDrawer');
  const navItem = $('.nav-item');
  // TweenLite.set(drawer, { yPercent: -100 });
  TweenLite.set(navItem, { xPercent: -100 });

  var hamburgerMotion = new TimelineMax()
    // .to(drawer, 0.1, { yPercent: 0 }, 0)
    .staggerTo(navItem, 0.6, { xPercent: 0, ease: Sine.easeOut }, 0.12, 0)
    .reverse();

  animateDrawer.on('click', function (e) {
    hamburgerMotion.reversed(!hamburgerMotion.reversed());
  });
  // アニメーション end

  openButton.addEventListener('click', onClickOpenButton, false);
  closeButton.addEventListener('click', onClickCloseButton, false);
  backdrop.addEventListener('click', onClickCloseButton, false);
  drawer.addEventListener('transitionend', onTransitionendDrawer, false);

  firstTabbable.addEventListener(
    'keydown',
    onKeydownTabKeyFirstTabbable,
    false
  );
  lastTabbable.addEventListener('keydown', onKeydownTabKeyLastTabbable, false);
  window.addEventListener('keydown', onKeydownEsc, false);

  scrollableTarget.addEventListener('touchstart', onTouchStart, false);
  scrollableTarget.addEventListener('touchmove', onTouchMove, false);
  backdrop.addEventListener('touchmove', onTouchMoveBackdrop, false);
})();
