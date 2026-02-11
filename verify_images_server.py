import subprocess
import time
import os
import signal
from playwright.sync_api import sync_playwright

def run():
    # Start HTTP server
    print("Starting HTTP server...")
    server_process = subprocess.Popen(
        ["python3", "-m", "http.server", "8000", "--directory", "_site"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    try:
        time.sleep(2) # Wait for server to start

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Verify Home Page Team Section
            print("Navigating to Home Page...")
            # Navigate to root, which serves index.html by default
            response = page.goto("http://localhost:8000/")
            if not response.ok:
                print(f"Failed to load home page: {response.status}")

            # Wait for team section
            team_section = page.locator("#team")
            if team_section.count() > 0:
                team_section.scroll_into_view_if_needed()
                page.wait_for_timeout(2000) # Give extra time for lazy loading

                print("Taking screenshot of team section...")
                team_section.screenshot(path="verification_team.png")
            else:
                print("Team section not found!")

            # Verify Gift Guide Post
            print("Navigating to Gift Guide Post...")
            # Note: The path depends on permalink structure. Earlier grep showed _site/blog/gift-guide-2024.html
            response = page.goto("http://localhost:8000/blog/gift-guide-2024.html")
            if not response.ok:
                print(f"Failed to load blog post: {response.status}")
                # Try directory index if html extension is stripped
                response = page.goto("http://localhost:8000/blog/gift-guide-2024/")

            # Find a figure
            figures = page.locator("figure")
            count = figures.count()
            print(f"Found {count} figures")

            if count > 0:
                # Capture the first few figures
                for i in range(min(3, count)):
                    fig = figures.nth(i)
                    fig.scroll_into_view_if_needed()
                    page.wait_for_timeout(1000)
                    fig.screenshot(path=f"verification_figure_{i}.png")

            browser.close()

    finally:
        print("Stopping HTTP server...")
        server_process.terminate()
        try:
            server_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server_process.kill()

if __name__ == "__main__":
    run()