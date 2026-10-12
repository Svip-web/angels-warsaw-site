document.documentElement.classList.add("js");

const hero = document.querySelector(".hero");
const siteContent = document.querySelector(".site-content");
const intro = document.querySelector(".intro");
const finalUI = document.querySelector(".final-ui");
const introHeader = document.querySelector(".intro-header");
const revealedHeader = document.querySelector(".site-header");
const backgroundVideo = document.querySelector(".reveal__background");
const contactVideo = document.querySelector(".contact__video");
const menuTriggers = document.querySelectorAll(".menu-trigger");
const menuPanel = document.querySelector(".menu-panel");
const menuScrim = document.querySelector(".menu-scrim");
const menuClose = document.querySelector(".menu-panel__close");
const scrollProgress = document.querySelector(".scroll-indicator span");
const revealThreshold = Math.max(120, Math.min(180, window.innerHeight * 0.18));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileViewport = window.matchMedia("(max-width: 680px)");
const saveData = navigator.connection?.saveData === true;

let previousScrollY = window.scrollY;
let frameRequested = false;
let menuReturnFocus = null;
let hasUserScrollIntent = false;
let touchStartY = null;
let isTouchScrolling = false;
let isMobileScrollActive = false;
let mobileScrollIdleTimer = 0;
let heroRevealSettleTimer = 0;
let syncContactVideoPlayback = () => {};

function showBackgroundVideo() {
  backgroundVideo.classList.add("is-ready");
}

function hideBackgroundVideo() {
  backgroundVideo.classList.remove("is-ready");
}

function syncBackgroundVideo() {
  const isPastHeroSequence = window.scrollY > window.innerHeight * 1.8;
  const isHeroRevealed = hero.classList.contains("is-revealed");
  const isAwayFromMobileHero = mobileViewport.matches && window.scrollY > window.innerHeight * 0.25;

  if (
    document.hidden ||
    prefersReducedMotion ||
    saveData ||
    isPastHeroSequence ||
    isAwayFromMobileHero ||
    !isHeroRevealed ||
    (mobileViewport.matches && (isTouchScrolling || isMobileScrollActive))
  ) {
    backgroundVideo.pause();
    return;
  }

  if (backgroundVideo.preload === "none") backgroundVideo.preload = "metadata";
  if (backgroundVideo.paused) backgroundVideo.play().catch(hideBackgroundVideo);
}

function setHeroInteractiveState(isRevealed) {
  intro.inert = isRevealed;
  introHeader.inert = isRevealed;
  finalUI.inert = !isRevealed;
  revealedHeader.inert = !isRevealed;
}

function revealHero() {
  if (hero.classList.contains("is-revealed")) return;
  hero.classList.add("is-revealed");
  setHeroInteractiveState(true);

  if (mobileViewport.matches) {
    window.clearTimeout(heroRevealSettleTimer);
    heroRevealSettleTimer = window.setTimeout(() => {
      hero.classList.add("is-reveal-settled");
    }, 1200);
  }
}

function setMenuOpen(isOpen, sourceTrigger = null) {
  const wasOpen = document.body.classList.contains("is-menu-open");
  document.body.classList.toggle("is-menu-open", isOpen);
  menuTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", String(isOpen)));
  menuPanel.setAttribute("aria-hidden", String(!isOpen));
  menuPanel.setAttribute("aria-modal", String(isOpen));

  if (isOpen) {
    menuReturnFocus = sourceTrigger || document.activeElement;
    menuPanel.inert = false;
    hero.inert = true;
    siteContent.inert = true;
    window.requestAnimationFrame(() => menuClose.focus({ preventScroll: true }));
  } else {
    hero.inert = false;
    siteContent.inert = false;
    setHeroInteractiveState(hero.classList.contains("is-revealed"));

    if (wasOpen && menuReturnFocus instanceof HTMLElement && menuReturnFocus.isConnected) {
      menuReturnFocus.focus({ preventScroll: true });
    }

    menuReturnFocus = null;
    menuPanel.inert = true;
  }
}

function updateScrollProgress(currentScrollY) {
  if (!mobileViewport.matches) {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    scrollProgress.style.transform = `scaleY(${Math.min(currentScrollY / maxScroll, 1)})`;
  }
  const shouldShowHeaderSurface = mobileViewport.matches
    ? hero.classList.contains("is-revealed")
    : currentScrollY > window.innerHeight * 1.1;
  revealedHeader.classList.toggle("has-surface", shouldShowHeaderSurface);
}

function syncHeroDormancy(currentScrollY = window.scrollY) {
  if (mobileViewport.matches) {
    // Recreating a hidden full-screen fixed layer causes a short hitch when the
    // user reverses scroll direction on mobile. Keep the settled hero mounted
    // behind the opaque page content instead.
    hero.classList.remove("is-dormant");
    return;
  }

  hero.classList.toggle("is-dormant", currentScrollY > window.innerHeight * 1.8);
}

function pauseHeavyHeroWorkDuringMobileScroll() {
  if (!mobileViewport.matches) return;

  isMobileScrollActive = true;
  if (!backgroundVideo.paused) backgroundVideo.pause();
  if (contactVideo && !contactVideo.paused) contactVideo.pause();
  window.clearTimeout(mobileScrollIdleTimer);
  mobileScrollIdleTimer = window.setTimeout(() => {
    isMobileScrollActive = false;
    syncBackgroundVideo();
    syncContactVideoPlayback();
  }, 520);
}

function updateFromScroll() {
  const currentScrollY = window.scrollY;
  const isScrollingDown = currentScrollY > previousScrollY;

  if (hasUserScrollIntent && isScrollingDown && currentScrollY > revealThreshold) revealHero();

  syncHeroDormancy(currentScrollY);
  updateScrollProgress(currentScrollY);
  if (!mobileViewport.matches) syncBackgroundVideo();
  previousScrollY = currentScrollY;
  frameRequested = false;
}

function handleScroll() {
  pauseHeavyHeroWorkDuringMobileScroll();
  if (frameRequested) return;
  frameRequested = true;
  window.requestAnimationFrame(updateFromScroll);
}

function resetHero() {
  setMenuOpen(false);
  window.clearTimeout(heroRevealSettleTimer);
  hero.classList.remove("is-revealed", "is-reveal-settled", "is-dormant");
  hasUserScrollIntent = false;
  setHeroInteractiveState(false);
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function getHashTarget() {
  if (!window.location.hash || window.location.hash === "#hero" || window.location.hash === "#booking") return null;

  try {
    return document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  } catch {
    return null;
  }
}

function syncDeepLinkPosition(target, behavior = "auto") {
  revealHero();
  backgroundVideo.pause();
  target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : behavior, block: "start" });
  previousScrollY = window.scrollY;
  syncHeroDormancy(previousScrollY);
  updateScrollProgress(previousScrollY);
  syncBackgroundVideo();
}

function focusNavigationTarget(target) {
  const focusTarget =
    target === hero && !hero.classList.contains("is-revealed")
      ? hero
      : target.querySelector("h1, h2, h3") || target;
  const hadTabIndex = focusTarget.hasAttribute("tabindex");

  if (!hadTabIndex) focusTarget.setAttribute("tabindex", "-1");
  focusTarget.dataset.navigationFocus = "";
  focusTarget.focus({ preventScroll: true });

  focusTarget.addEventListener(
    "blur",
    () => {
      delete focusTarget.dataset.navigationFocus;
      if (!hadTabIndex) focusTarget.removeAttribute("tabindex");
    },
    { once: true },
  );
}

function getVisibleNavigationTarget() {
  if (window.scrollY < window.innerHeight * 1.65) return hero;

  const sections = Array.from(document.querySelectorAll(".site-content section[id]"));
  return sections.reduce((current, section) => {
    return section.getBoundingClientRect().top <= 96 ? section : current;
  }, hero);
}

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const initialHashTarget = getHashTarget();
if (initialHashTarget) syncDeepLinkPosition(initialHashTarget);

window.addEventListener(
  "pageshow",
  (event) => {
    setMenuOpen(false);
    const hashTarget = getHashTarget();

    if (hashTarget) {
      syncDeepLinkPosition(hashTarget);
      window.requestAnimationFrame(() => syncDeepLinkPosition(hashTarget));
    } else if (!event.persisted) {
      hero.classList.remove("is-revealed");
      hasUserScrollIntent = false;
      setHeroInteractiveState(false);
      window.scrollTo(0, 0);
    } else if (window.scrollY > revealThreshold) {
      revealHero();
    } else {
      setHeroInteractiveState(hero.classList.contains("is-revealed"));
    }

    if (!hashTarget) {
      previousScrollY = window.scrollY;
      syncHeroDormancy(previousScrollY);
      updateScrollProgress(previousScrollY);
      syncBackgroundVideo();
    }
  },
);

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener(
  "wheel",
  (event) => {
    if (event.deltaY > 0) hasUserScrollIntent = true;
  },
  { passive: true },
);
window.addEventListener(
  "touchstart",
  (event) => {
    touchStartY = event.touches[0]?.clientY ?? null;
    isTouchScrolling = true;
    if (mobileViewport.matches && !backgroundVideo.paused) backgroundVideo.pause();
  },
  { passive: true },
);
window.addEventListener(
  "touchmove",
  (event) => {
    const currentTouchY = event.touches[0]?.clientY;
    if (touchStartY !== null && currentTouchY !== undefined && currentTouchY < touchStartY - 8) {
      hasUserScrollIntent = true;
    }
  },
  { passive: true },
);
const finishTouchScroll = () => {
  touchStartY = null;
  isTouchScrolling = false;
  syncBackgroundVideo();
};
window.addEventListener("touchend", finishTouchScroll, { passive: true });
window.addEventListener("touchcancel", finishTouchScroll, { passive: true });
window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "PageDown", "End", " "].includes(event.key)) hasUserScrollIntent = true;
});
window.addEventListener("hashchange", () => {
  setMenuOpen(false);
  const hashTarget = getHashTarget();

  if (hashTarget) {
    syncDeepLinkPosition(hashTarget, "smooth");
    window.requestAnimationFrame(() => focusNavigationTarget(hashTarget));
    return;
  }

  if (window.location.hash === "#hero") {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    hero.classList.remove("is-dormant");
    previousScrollY = 0;
    updateScrollProgress(0);
    syncBackgroundVideo();
    window.requestAnimationFrame(() => focusNavigationTarget(hero));
    return;
  }

  window.requestAnimationFrame(() => {
    previousScrollY = window.scrollY;
    syncHeroDormancy(previousScrollY);
    updateScrollProgress(previousScrollY);
    syncBackgroundVideo();
    focusNavigationTarget(getVisibleNavigationTarget());
  });
});

menuTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    setMenuOpen(!document.body.classList.contains("is-menu-open"), trigger);
  });
});

menuScrim.addEventListener("click", () => setMenuOpen(false));
menuClose.addEventListener("click", () => setMenuOpen(false));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const hash = link.getAttribute("href");
    if (hash === "#booking") return;
    const target = hash === "#hero" ? hero : document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();
    setMenuOpen(false);
    if (window.location.hash !== hash) history.pushState(null, "", hash);

    if (target === hero) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      hero.classList.remove("is-dormant");
      previousScrollY = 0;
      updateScrollProgress(0);
      syncBackgroundVideo();
    } else {
      syncDeepLinkPosition(target, "smooth");
    }

    focusNavigationTarget(target);
  });
});

document.addEventListener("keydown", (event) => {
  const menuIsOpen = document.body.classList.contains("is-menu-open");

  if (event.key === "Escape" && menuIsOpen) {
    event.preventDefault();
    setMenuOpen(false);
    return;
  }

  if (event.key !== "Tab" || !menuIsOpen) return;

  const focusableElements = Array.from(
    menuPanel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ).filter((element) => !element.inert && element.offsetParent !== null);

  if (focusableElements.length === 0) {
    event.preventDefault();
    menuPanel.focus({ preventScroll: true });
    return;
  }

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && (document.activeElement === firstFocusable || !menuPanel.contains(document.activeElement))) {
    event.preventDefault();
    lastFocusable.focus();
  } else if (!event.shiftKey && document.activeElement === lastFocusable) {
    event.preventDefault();
    firstFocusable.focus();
  }
});

backgroundVideo.addEventListener("playing", showBackgroundVideo);
backgroundVideo.addEventListener("loadeddata", showBackgroundVideo, { once: true });
backgroundVideo.addEventListener("waiting", hideBackgroundVideo);
backgroundVideo.addEventListener("stalled", hideBackgroundVideo);
document.addEventListener("visibilitychange", () => {
  syncBackgroundVideo();
});

if (contactVideo) {
  let contactVideoIsNear = false;

  syncContactVideoPlayback = () => {
    if (
      document.hidden ||
      prefersReducedMotion ||
      saveData ||
      !contactVideoIsNear ||
      (mobileViewport.matches && (isTouchScrolling || isMobileScrollActive))
    ) {
      contactVideo.pause();
      return;
    }

    if (contactVideo.preload === "none") {
      contactVideo.preload = "metadata";
      contactVideo.load();
    }

    if (contactVideo.paused) contactVideo.play().catch(() => {});
  };

  if (!prefersReducedMotion && !saveData && "IntersectionObserver" in window) {
    const contactVideoObserver = new IntersectionObserver(
      ([entry]) => {
        contactVideoIsNear = entry.isIntersecting;
        syncContactVideoPlayback();
      },
      { rootMargin: "320px 0px", threshold: 0.01 },
    );

    contactVideoObserver.observe(contactVideo);
  } else if (!prefersReducedMotion && !saveData) {
    contactVideoIsNear = true;
    syncContactVideoPlayback();
  }

  document.addEventListener("visibilitychange", syncContactVideoPlayback);
}

if (prefersReducedMotion || saveData) {
  backgroundVideo.preload = "none";
  backgroundVideo.pause();
} else if (!initialHashTarget) {
  syncBackgroundVideo();
}

const revealElements = document.querySelectorAll("[data-reveal]");

if (prefersReducedMotion || mobileViewport.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("in-view"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12%", threshold: 0.08 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(track?.children || []);
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const currentLabel = carousel.querySelector("[data-carousel-current]");
  const progress = carousel.querySelector("[data-carousel-progress]");

  if (!track || slides.length === 0) return;

  let activeIndex = 0;
  let carouselFrame = 0;

  const setActiveIndex = (index) => {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, "0");
    if (progress) progress.style.transform = `scaleX(${(activeIndex + 1) / slides.length})`;
    if (previousButton) previousButton.disabled = activeIndex === 0;
    if (nextButton) nextButton.disabled = activeIndex === slides.length - 1;
  };

  const updateActiveSlide = () => {
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const distance = Math.abs(slideRect.left + slideRect.width / 2 - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
    carouselFrame = 0;
  };

  const scrollToSlide = (index) => {
    const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
    const trackRect = track.getBoundingClientRect();
    const slideRect = slides[targetIndex].getBoundingClientRect();
    const scrollPadding = Number.parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const targetLeft = track.scrollLeft + slideRect.left - trackRect.left - scrollPadding;

    track.scrollTo({
      left: targetLeft,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    setActiveIndex(targetIndex);
  };

  track.addEventListener(
    "scroll",
    () => {
      if (carouselFrame) return;
      carouselFrame = window.requestAnimationFrame(updateActiveSlide);
    },
    { passive: true },
  );

  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    scrollToSlide(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  previousButton?.addEventListener("click", () => scrollToSlide(activeIndex - 1));
  nextButton?.addEventListener("click", () => scrollToSlide(activeIndex + 1));
  window.addEventListener("resize", updateActiveSlide, { passive: true });
  setActiveIndex(0);
});

document.querySelectorAll("[data-events-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-events-track]");
  const previousButton = carousel.querySelector("[data-events-prev]");
  const nextButton = carousel.querySelector("[data-events-next]");
  const currentLabel = carousel.querySelector("[data-events-current]");
  const progress = carousel.querySelector("[data-events-progress]");
  const slideCount = track?.children.length || 0;

  if (!track || slideCount < 2) return;

  let activeIndex = 0;
  let isAnimating = false;
  let pointerStartX = null;

  const updateStatus = () => {
    if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, "0");
    if (progress) progress.style.transform = `scaleX(${(activeIndex + 1) / slideCount})`;
  };

  const getStep = () => {
    const firstCard = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    return (firstCard?.getBoundingClientRect().width || 0) + gap;
  };

  const finishAfterTransition = (callback) => {
    let isFinished = false;
    let fallbackTimer = 0;
    const finish = (event) => {
      if (isFinished) return;
      if (event && event.target !== track) return;
      isFinished = true;
      track.removeEventListener("transitionend", finish);
      window.clearTimeout(fallbackTimer);
      callback();
    };

    track.addEventListener("transitionend", finish);
    fallbackTimer = window.setTimeout(() => finish(), 620);
  };

  const showNext = () => {
    if (isAnimating) return;
    const firstCard = track.firstElementChild;
    if (!firstCard) return;

    if (prefersReducedMotion) {
      track.append(firstCard);
      activeIndex = (activeIndex + 1) % slideCount;
      updateStatus();
      return;
    }

    isAnimating = true;
    const wrapClone = firstCard.cloneNode(true);
    wrapClone.setAttribute("aria-hidden", "true");
    track.append(wrapClone);
    track.style.transition = "transform 520ms var(--ease-cinematic)";
    track.style.transform = `translate3d(-${getStep()}px, 0, 0)`;

    finishAfterTransition(() => {
      track.style.transition = "none";
      firstCard.remove();
      wrapClone.replaceWith(firstCard);
      track.style.transform = "translate3d(0, 0, 0)";
      track.offsetWidth;
      track.style.transition = "";
      activeIndex = (activeIndex + 1) % slideCount;
      isAnimating = false;
      updateStatus();
    });
  };

  const showPrevious = () => {
    if (isAnimating) return;
    const lastCard = track.lastElementChild;
    if (!lastCard) return;

    track.prepend(lastCard);
    activeIndex = (activeIndex - 1 + slideCount) % slideCount;

    if (prefersReducedMotion) {
      updateStatus();
      return;
    }

    isAnimating = true;
    const wrapClone = lastCard.cloneNode(true);
    wrapClone.setAttribute("aria-hidden", "true");
    track.prepend(wrapClone);
    track.style.transition = "none";
    track.style.transform = `translate3d(-${getStep()}px, 0, 0)`;
    track.offsetWidth;
    track.style.transition = "transform 520ms var(--ease-cinematic)";
    track.style.transform = "translate3d(0, 0, 0)";

    finishAfterTransition(() => {
      track.style.transition = "";
      track.style.transform = "";
      lastCard.remove();
      wrapClone.replaceWith(lastCard);
      isAnimating = false;
      updateStatus();
    });
  };

  previousButton?.addEventListener("click", showPrevious);
  nextButton?.addEventListener("click", showNext);

  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    if (event.key === "ArrowRight") showNext();
    else showPrevious();
  });

  track.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
  });

  track.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) < 42) return;
    if (distance < 0) showNext();
    else showPrevious();
  });

  track.addEventListener("pointercancel", () => {
    pointerStartX = null;
  });

  updateStatus();
});

menuPanel.inert = true;
setHeroInteractiveState(hero.classList.contains("is-revealed"));
updateScrollProgress(window.scrollY);
window.__resetAngelsHero = resetHero;
