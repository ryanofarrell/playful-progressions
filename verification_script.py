from playwright.sync_api import sync_playwright

def verify_cta():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            response = page.goto("http://localhost:4000/blog/sensory-processing-in-womb.html")
            if response.status != 200:
                print(f"Failed to load page: {response.status}")
                return

            # Locate the CTA container
            cta_container = page.locator(".bg-light.p-5.rounded").filter(has_text="Does this sound familiar?")

            # Wait for it to be visible
            cta_container.wait_for(state="visible", timeout=5000)

            print("CTA container found and visible.")

            # take a screenshot of the element
            cta_container.screenshot(path="verification_cta.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_cta()
