document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".btn-filter");
  const postCards = document.querySelectorAll(".blog-post-card");
  // Get the container of the filter buttons
  const filterContainer = document.getElementById("blog-filters");

  // Cache post card data to avoid redundant DOM reads during filtering
  const postCardsData = Array.from(postCards).map((card) => ({
    element: card,
    tags: card.getAttribute("data-tags") || "",
  }));

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const selectedTag = this.getAttribute("data-tag");

      // Remove 'active' class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      // Add 'active' class to the clicked button
      this.classList.add("active");

      // Add/remove 'filter-active' class on the container based on the selected tag
      if (selectedTag === "all") {
        filterContainer.classList.remove("filter-active");
      } else {
        filterContainer.classList.add("filter-active");
      }

      postCardsData.forEach((cardData) => {
        if (selectedTag === "all" || cardData.tags === selectedTag) {
          cardData.element.style.display = ""; // Revert to original CSS-defined display
        } else {
          cardData.element.style.display = "none";
        }
      });
    });
  });
});
