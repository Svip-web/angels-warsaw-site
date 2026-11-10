(function () {
  "use strict";

  const menu = window.ANGELS_MENU;
  if (!menu) return;

  const formatPrice = (value) =>
    new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
      maximumFractionDigits: 2,
    }).format(value);

  const slugify = (value) =>
    value
      .toLowerCase()
      .replace(/&/g, "-and-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const placeholderIcon = (kind) => {
    if (kind === "hookah") {
      return '<svg class="menu-catalog__placeholder-icon" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:0.55"><path d="M9 3h6l-1 3h-4L9 3ZM12 6v8m-2 0h4l2 4a2 2 0 0 1-2 3h-4a2 2 0 0 1-2-3l2-4Zm4-4h3a3 3 0 0 1 3 3v3m-3 0h3M8 8h8"/></svg>';
    }
    if (kind === "cocktail") {
      return '<svg class="menu-catalog__placeholder-icon" viewBox="0 0 120 120" aria-hidden="true"><path d="M21 22h78L68 62v28h18v8H34v-8h18V62L21 22Z"/><path d="M33 32h54L61 55h-2L33 32Z"/><path d="M78 16c8 2 14 8 17 17"/></svg>';
    }
    if (kind === "kitchen") {
      return '<svg class="menu-catalog__placeholder-icon" viewBox="0 0 120 120" aria-hidden="true"><path d="M18 82h84M27 82v-5c0-26 15-43 33-43s33 17 33 43v5M60 34V23M51 23h18M13 92h94"/></svg>';
    }
    return '<svg class="menu-catalog__placeholder-icon" viewBox="0 0 120 120" aria-hidden="true"><path d="M34 20h52L80 96H40L34 20ZM30 20h60M44 45h33M69 20c2-11 10-17 22-18"/></svg>';
  };

  const createPlaceholderMedia = (group) => {
    const figure = document.createElement("figure");
    const kind = group === menu.hookah
      ? "hookah"
      : group.key === "COCKTAILS"
      ? "cocktail"
      : menu.kitchen.groups.includes(group)
        ? "kitchen"
        : "bar";
    figure.className = `menu-catalog__media menu-catalog__media--placeholder menu-catalog__media--${kind}`;
    figure.innerHTML = `
      <span class="menu-catalog__placeholder-orbit" aria-hidden="true"></span>
      ${placeholderIcon(kind)}
      <img class="menu-catalog__placeholder-logo" src="assets/angels-wordmark-v2.webp" alt="" width="800" height="396" loading="lazy" decoding="async" />
      ${kind === "hookah" ? "" : '<span class="menu-catalog__placeholder-note">Фото скоро</span>'}
    `;
    return figure;
  };

  const getItemCategory = (subgroup, group) =>
    (subgroup.title || group.title).replace(/\s*[·•]\s*.*$/, "").trim();

  const createItemMedia = (item, group) => {
    if (!item.image) return createPlaceholderMedia(group);

    const figure = document.createElement("figure");
    figure.className = "menu-catalog__media menu-catalog__media--product";
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.name;
    image.loading = "lazy";
    image.decoding = "async";
    figure.append(image);
    return figure;
  };

  const createItem = (item, group, subgroup) => {
    const row = document.createElement("li");
    row.className = "menu-catalog__item";

    const media = createItemMedia(item, group);

    const body = document.createElement("div");
    body.className = "menu-catalog__item-body";

    const category = document.createElement("span");
    category.className = "menu-catalog__item-category";
    category.textContent = getItemCategory(subgroup, group);

    const name = document.createElement("h5");
    name.className = "menu-catalog__item-name";
    name.textContent = item.name;

    const prices = document.createElement("div");
    prices.className = "menu-catalog__prices";

    item.prices.forEach((price) => {
      const value = document.createElement("span");
      value.className = "menu-catalog__price";
      if (price.label) {
        const label = document.createElement("small");
        label.textContent = price.label;
        value.append(label);
      }
      const amount = document.createElement("strong");
      amount.textContent = `${formatPrice(price.value)} zł`;
      value.append(amount);
      prices.append(value);
    });

    body.append(category, name);
    if (item.description) {
      const description = document.createElement("p");
      description.className = "menu-catalog__item-description";
      description.textContent = item.description;
      body.append(description);
    }
    body.append(prices);
    row.append(media, body);
    return row;
  };

  const createSubgroup = (subgroup, group) => {
    const block = document.createElement("section");
    block.className = "menu-catalog__subgroup";

    const list = document.createElement("ul");
    subgroup.items.forEach((item) => list.append(createItem(item, group, subgroup)));
    block.append(list);
    return block;
  };

  const countItems = (group) =>
    group.subgroups.reduce((total, subgroup) => total + subgroup.items.length, 0);

  const createGroup = (group, open, groupId) => {
    const details = document.createElement("details");
    details.className = "menu-catalog__group";
    details.open = open;
    details.id = groupId;
    details.dataset.navLabel = group.title;

    const summary = document.createElement("summary");
    const title = document.createElement("span");
    title.textContent = group.title;
    const meta = document.createElement("span");
    meta.className = "menu-catalog__summary-meta";
    meta.innerHTML = `<small>${countItems(group)} поз.</small>`;
    summary.append(title, meta);
    details.append(summary);

    const body = document.createElement("div");
    body.className = "menu-catalog__group-body";
    group.subgroups.forEach((subgroup) => body.append(createSubgroup(subgroup, group)));
    details.append(body);
    return details;
  };

  const renderCatalog = (selector, groups, options = {}) => {
    const target = document.querySelector(selector);
    if (!target) return;
    const fragment = document.createDocumentFragment();
    groups.forEach((group, index) => {
      const open = options.openAll || options.openKeys?.includes(group.key) || index === 0;
      const groupId = `${options.sectionId}-${slugify(group.key)}`;
      fragment.append(createGroup(group, open, groupId));
    });
    target.replaceChildren(fragment);
  };

  const barGroups = menu.bar.groups.filter(
    (group) => !["NON-ALCOHOLIC", "COFFEE & TEA"].includes(group.key),
  );
  const zeroProofGroups = menu.bar.groups.filter((group) =>
    ["NON-ALCOHOLIC", "COFFEE & TEA"].includes(group.key),
  );

  renderCatalog("#bar-catalog", barGroups, { sectionId: "bar", openKeys: ["COCKTAILS"] });
  renderCatalog("#kitchen-catalog", menu.kitchen.groups, { sectionId: "kitchen", openAll: true });
  renderCatalog("#non-alcoholic", zeroProofGroups, {
    sectionId: "non-alcoholic",
    openAll: true,
  });
  document.querySelector("#hookah-catalog")?.append(createSubgroup(menu.hookah, menu.hookah));

  window.ANGELS_I18N?.apply(document);

  const note = document.querySelector("#kitchen-note");
  if (note && menu.kitchen.notes.length) note.textContent = menu.kitchen.notes[0];

  const quickNavLinks = Array.from(document.querySelectorAll(".menu-page__quick-nav a[href^='#']"));
  const quickNavSections = quickNavLinks
    .map((link) => ({ link, section: document.querySelector(link.hash) }))
    .filter(({ section }) => section);
  const secondaryNav = document.querySelector(".menu-page__subnav");
  const secondaryNavTrack = secondaryNav?.querySelector(".menu-page__subnav-track");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderedSecondarySection = null;
  let activeSecondaryId = null;

  const getSectionGroups = (sectionId) =>
    Array.from(document.getElementById(sectionId)?.querySelectorAll(".menu-catalog__group") || []);

  const setActiveSecondaryNav = (groupId) => {
    if (!secondaryNavTrack) return;

    const links = Array.from(secondaryNavTrack.querySelectorAll("a"));
    const nextActiveLink = links.find((link) => link.hash === `#${groupId}`);

    links.forEach((link) => {
      const isActive = link === nextActiveLink;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });

    if (!nextActiveLink || activeSecondaryId === groupId) return;
    activeSecondaryId = groupId;

    const targetLeft = nextActiveLink.offsetLeft - (secondaryNavTrack.clientWidth - nextActiveLink.clientWidth) / 2;
    secondaryNavTrack.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
  };

  const renderSecondaryNav = (sectionId) => {
    if (!secondaryNav || !secondaryNavTrack) return;

    const groups = getSectionGroups(sectionId);
    if (!groups.length) {
      secondaryNav.classList.remove("is-visible");
      secondaryNav.setAttribute("aria-hidden", "true");
      renderedSecondarySection = null;
      activeSecondaryId = null;
      return;
    }

    if (renderedSecondarySection === sectionId) return;

    const sectionTitle = document.querySelector(`#${sectionId} h2`)?.textContent?.trim() || "меню";
    const fragment = document.createDocumentFragment();

    groups.forEach((group) => {
      const link = document.createElement("a");
      link.href = `#${group.id}`;
      link.textContent = group.dataset.navLabel || group.querySelector("summary")?.textContent?.trim();
      link.addEventListener("click", (event) => {
        event.preventDefault();
        group.open = true;
        setActiveSecondaryNav(group.id);
        window.requestAnimationFrame(() => {
          group.scrollIntoView({
            behavior: prefersReducedMotion.matches ? "auto" : "smooth",
            block: "start",
          });
          window.history.replaceState(null, "", `#${group.id}`);
        });
      });
      fragment.append(link);
    });

    secondaryNavTrack.replaceChildren(fragment);
    secondaryNav.setAttribute("aria-label", `Категории раздела ${sectionTitle}`);
    secondaryNav.setAttribute("aria-hidden", "false");
    secondaryNav.classList.add("is-visible");
    renderedSecondarySection = sectionId;
    activeSecondaryId = null;
  };

  if (quickNavSections.length) {
    const setActiveQuickNav = (activeId) => {
      quickNavSections.forEach(({ link, section }) => {
        const isActive = section.id === activeId;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const updateActiveQuickNav = () => {
      const activationLine = window.scrollY + (window.innerWidth <= 680 ? 188 : 150);
      let activeId = null;

      quickNavSections.forEach(({ section }) => {
        if (section.offsetTop <= activationLine) activeId = section.id;
      });

      setActiveQuickNav(activeId);
      renderSecondaryNav(activeId);

      if (activeId) {
        const groups = getSectionGroups(activeId);
        let activeGroupId = groups[0]?.id || null;
        groups.forEach((group) => {
          if (group.offsetTop <= activationLine) activeGroupId = group.id;
        });
        setActiveSecondaryNav(activeGroupId);
      }
    };

    let quickNavFrame = 0;
    const scheduleQuickNavUpdate = () => {
      if (quickNavFrame) return;
      quickNavFrame = window.requestAnimationFrame(() => {
        quickNavFrame = 0;
        updateActiveQuickNav();
      });
    };

    quickNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const sectionId = link.hash.slice(1);
        setActiveQuickNav(sectionId);
        renderSecondaryNav(sectionId);
      });
    });

    window.addEventListener("scroll", scheduleQuickNavUpdate, { passive: true });
    window.addEventListener("resize", scheduleQuickNavUpdate);
    window.addEventListener("hashchange", scheduleQuickNavUpdate);
    updateActiveQuickNav();
  }
})();
