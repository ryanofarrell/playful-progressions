document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".btn-filter");
  const postCards = document.querySelectorAll(".blog-post-card");
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

      postCards.forEach((card) => {
        const cardTags = card.getAttribute("data-tags");

        if (selectedTag === "all" || cardTags.includes(selectedTag)) {
          card.style.display = "block"; // Or your desired display property (e.g., 'flex')
        } else {
          card.style.display = "none";
        }
      });
    });
  });
});
