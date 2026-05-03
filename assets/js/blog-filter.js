document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".btn-filter");
  const postCards = document.querySelectorAll(".blog-post-card");
  // Cache the post cards data to avoid repeated DOM queries and attribute lookups
  const postCardsData = Array.from(postCards).map((card) => ({
    element: card,
    tags: card.getAttribute("data-tags") || "",
  }));

  // Get the container of the filter buttons
  const filterContainer = document.getElementById("blog-filters");

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

      postCardsData.forEach((data) => {
        const isVisible = selectedTag === "all" || data.tags === selectedTag;

        // Use classList.toggle with the 'd-none' class for better performance than direct style manipulation
        data.element.classList.toggle("d-none", !isVisible);
      });
    });
  });
});
