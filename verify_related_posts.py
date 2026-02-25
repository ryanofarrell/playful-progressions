from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://127.0.0.1:4000/blog/basics-motor-planning.html")

        # Scroll to related posts
        related_posts = page.locator(".related-posts")
        related_posts.scroll_into_view_if_needed()

        # Take screenshot of the related posts section
        page.locator(".related-posts").screenshot(path="verification_related_posts.png")

        # Verify the HTML structure of the first picture in related posts
        # We look for the first picture inside related-posts
        # And check if it has source with srcset containing '400.avif'

        html = page.locator(".related-posts picture").nth(1).inner_html() # nth(1) because first picture might be inside the card link, wait. related-posts contains multiple cards.
        # Actually, let's just grab the first one found.
        html = page.locator(".related-posts picture").first.inner_html()
        print("HTML of first picture:", html)

        if "-400.avif" in html and "-800.avif" in html:
            print("SUCCESS: Found optimized images in srcset")
        else:
            print("FAILURE: Did not find optimized images in srcset")

        browser.close()

if __name__ == "__main__":
    run()
