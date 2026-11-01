(function () {
  "use strict";

  const menu = window.ANGELS_MENU;
  if (!menu) return;

  const formatPrice = (value) =>
    new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
      maximumFractionDigits: 2,
    }).format(value);

  const cocktailImages = Array.from(
    { length: 10 },
    (_, index) => `assets/menu-cocktail-${String(index + 1).padStart(2, "0")}.webp`,
  );

  const kitchenImages = [
    "assets/story-kitchen.webp",
    "assets/story-kitchen.webp",
    "assets/story-kitchen.webp",
  ];

  const hashText = (value) =>
    Array.from(value).reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0);

  const slugify = (value) =>
    value
      .toLowerCase()
      .replace(/&/g, "-and-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const getItemImage = (item, group, itemIndex) => {
    const isKitchen = menu.kitchen.groups.includes(group);
    const images = isKitchen ? kitchenImages : cocktailImages;
    return images[(hashText(`${group.key}-${item.name}`) + itemIndex) % images.length];
  };

  const createItem = (item, group, subgroup, itemIndex) => {
    const row = document.createElement("li");
    row.className = "menu-catalog__item";

    const media = document.createElement("figure");
    media.className = "menu-catalog__media";
    const image = document.createElement("img");
    image.src = getItemImage(item, group, itemIndex);
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 640;
    image.height = 480;
    media.append(image);

    const body = document.createElement("div");
    body.className = "menu-catalog__item-body";

    const category = document.createElement("span");
    category.className = "menu-catalog__item-category";
    category.textContent = subgroup.title || group.title;

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

    body.append(category, name, prices);
    row.append(media, body);
    return row;
  };

  const createSubgroup = (subgroup, group) => {
    const block = document.createElement("section");
    block.className = "menu-catalog__subgroup";

    const list = document.createElement("ul");
    subgroup.items.forEach((item, itemIndex) =>
      list.append(createItem(item, group, subgroup, itemIndex)),
    );
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
  renderCatalog("#non-alcoholic-catalog", zeroProofGroups, {
    sectionId: "non-alcoholic",
    openAll: true,
  });

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

    if (!sectionId) {
      secondaryNav.classList.remove("is-visible");
      secondaryNav.setAttribute("aria-hidden", "true");
      renderedSecondarySection = null;
      activeSecondaryId = null;
      return;
    }

    if (renderedSecondarySection === sectionId) return;

    const groups = getSectionGroups(sectionId);
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
      const activationLine = window.scrollY + (window.innerWidth <= 680 ? 184 : 150);
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
