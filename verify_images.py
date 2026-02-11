from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Verify Home Page Team Section
        print("Navigating to Home Page...")
        page.goto("file:///app/_site/index.html")

        # Wait for team section
        team_section = page.locator("#team")
        if team_section.count() > 0:
            team_section.scroll_into_view_if_needed()
            page.wait_for_timeout(1000) # Give time for lazy loading

            print("Taking screenshot of team section...")
            team_section.screenshot(path="verification_team.png")
        else:
            print("Team section not found!")

        # Verify Gift Guide Post
        print("Navigating to Gift Guide Post...")
        page.goto("file:///app/_site/blog/gift-guide-2024.html")

        # Find a figure
        figures = page.locator("figure")
        count = figures.count()
        print(f"Found {count} figures")

        if count > 0:
            # Capture the first few figures
            for i in range(min(3, count)):
                fig = figures.nth(i)
                fig.scroll_into_view_if_needed()
                page.wait_for_timeout(500)
                fig.screenshot(path=f"verification_figure_{i}.png")

        browser.close()

if __name__ == "__main__":
    run()