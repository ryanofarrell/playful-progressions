document.addEventListener("DOMContentLoaded", function () {
  const BATCH_SIZE = 12;
  let visibleCount = BATCH_SIZE;
  let currentTag = "all";

  const filterButtons = document.querySelectorAll(".btn-filter");
  const postCards = document.querySelectorAll(".blog-post-card");
  const filterContainer = document.getElementById("blog-filters");
  const loadMoreContainer = document.getElementById("blog-load-more-container");
  const loadMoreBtn = document.getElementById("btn-load-more");
  const statusEl = document.getElementById("blog-posts-status");

  // Cache card elements and their tags for optimal performance
  const postCardsData = Array.from(postCards).map((card) => ({
    element: card,
    tags: (card.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean),
  }));

  function applyFilterAndPagination(options) {
    const focusFirstNew = options && options.focusFirstNew;
    const matchingCards = [];
    const nonMatchingCards = [];

    postCardsData.forEach((item) => {
      if (currentTag === "all" || item.tags.includes(currentTag)) {
        matchingCards.push(item);
      } else {
        nonMatchingCards.push(item);
      }
    });

    // Immediately hide all non-matching cards
    nonMatchingCards.forEach((item) => {
      item.element.classList.add("d-none");
    });

    let newlyRevealedCard = null;

    matchingCards.forEach((item, idx) => {
      const shouldShow = idx < visibleCount;
      const isCurrentlyHidden = item.element.classList.contains("d-none");

      item.element.classList.toggle("d-none", !shouldShow);

      if (shouldShow && isCurrentlyHidden && !newlyRevealedCard) {
        newlyRevealedCard = item.element;
      }
    });

    const totalMatching = matchingCards.length;
    const currentShown = Math.min(visibleCount, totalMatching);

    // Manage Load More button state
    if (loadMoreContainer && loadMoreBtn) {
      if (totalMatching > visibleCount) {
        loadMoreContainer.classList.remove("d-none");
        const remaining = totalMatching - visibleCount;
        loadMoreBtn.textContent = `Load More Posts (${remaining} remaining)`;
      } else {
        loadMoreContainer.classList.add("d-none");
      }
    }

    // Update screen reader and visual status
    if (statusEl) {
      if (totalMatching === 0) {
        statusEl.textContent = "No posts found for this category.";
      } else {
        statusEl.textContent = `Showing ${currentShown} of ${totalMatching} post${totalMatching === 1 ? "" : "s"}`;
      }
    }

    // Shift keyboard focus to the first newly revealed post card
    if (focusFirstNew && newlyRevealedCard) {
      const firstInteractive = newlyRevealedCard.querySelector("a, button");
      if (firstInteractive) {
        firstInteractive.focus();
      }
    }
  }

  function selectTag(tag, updateUrl) {
    currentTag = tag || "all";
    visibleCount = BATCH_SIZE;

    filterButtons.forEach((btn) => {
      const btnTag = btn.getAttribute("data-tag");
      btn.classList.toggle("active", btnTag === currentTag);
    });

    if (filterContainer) {
      filterContainer.classList.toggle("filter-active", currentTag !== "all");
    }

    applyFilterAndPagination({ focusFirstNew: false });

    if (updateUrl && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      if (currentTag === "all") {
        url.searchParams.delete("tag");
      } else {
        url.searchParams.set("tag", currentTag);
      }
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }

  // Filter button event listeners
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const selectedTag = this.getAttribute("data-tag");
      selectTag(selectedTag, true);
    });
  });

  // Load More button event listener
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      visibleCount += BATCH_SIZE;
      applyFilterAndPagination({ focusFirstNew: true });
    });
  }

  // Check URL parameters for pre-selected tag
  const urlParams = new URLSearchParams(window.location.search);
  const initialTag = urlParams.get("tag");
  const hasTagButton = Array.from(filterButtons).some((b) => b.getAttribute("data-tag") === initialTag);

  if (initialTag && hasTagButton) {
    selectTag(initialTag, false);
  } else {
    selectTag("all", false);
  }
});
