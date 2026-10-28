(function () {
  "use strict";

  const menu = window.ANGELS_MENU;
  if (!menu) return;

  const formatPrice = (value) =>
    new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
      maximumFractionDigits: 2,
    }).format(value);

  const createItem = (item) => {
    const row = document.createElement("li");
    row.className = "menu-catalog__item";

    const name = document.createElement("span");
    name.className = "menu-catalog__item-name";
    name.textContent = item.name;
    row.append(name);

    const prices = document.createElement("span");
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

    row.append(prices);
    return row;
  };

  const createSubgroup = (subgroup) => {
    const block = document.createElement("section");
    block.className = "menu-catalog__subgroup";

    if (subgroup.title) {
      const heading = document.createElement("h4");
      heading.textContent = subgroup.title;
      block.append(heading);
    }

    const list = document.createElement("ul");
    subgroup.items.forEach((item) => list.append(createItem(item)));
    block.append(list);
    return block;
  };

  const countItems = (group) =>
    group.subgroups.reduce((total, subgroup) => total + subgroup.items.length, 0);

  const createGroup = (group, open) => {
    const details = document.createElement("details");
    details.className = "menu-catalog__group";
    details.open = open;

    const summary = document.createElement("summary");
    const title = document.createElement("span");
    title.textContent = group.title;
    const meta = document.createElement("span");
    meta.className = "menu-catalog__summary-meta";
    meta.innerHTML = `<small>${countItems(group)} поз.</small><i aria-hidden="true"></i>`;
    summary.append(title, meta);
    details.append(summary);

    const body = document.createElement("div");
    body.className = "menu-catalog__group-body";
    group.subgroups.forEach((subgroup) => body.append(createSubgroup(subgroup)));
    details.append(body);
    return details;
  };

  const renderCatalog = (selector, groups, options = {}) => {
    const target = document.querySelector(selector);
    if (!target) return;
    const fragment = document.createDocumentFragment();
    groups.forEach((group, index) => {
      const open = options.openAll || options.openKeys?.includes(group.key) || index === 0;
      fragment.append(createGroup(group, open));
    });
    target.replaceChildren(fragment);
  };

  const barGroups = menu.bar.groups.filter(
    (group) => !["NON-ALCOHOLIC", "COFFEE & TEA"].includes(group.key),
  );
  const zeroProofGroups = menu.bar.groups.filter((group) =>
    ["NON-ALCOHOLIC", "COFFEE & TEA"].includes(group.key),
  );

  renderCatalog("#bar-catalog", barGroups, { openKeys: ["COCKTAILS"] });
  renderCatalog("#kitchen-catalog", menu.kitchen.groups, { openAll: true });
  renderCatalog("#non-alcoholic-catalog", zeroProofGroups, { openAll: true });

  const note = document.querySelector("#kitchen-note");
  if (note && menu.kitchen.notes.length) note.textContent = menu.kitchen.notes[0];
})();
