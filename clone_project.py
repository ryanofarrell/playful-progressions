#!/usr/bin/env python3
import os
import shutil
import re
import argparse


def parse_aiinclude(aiinclude_path):
    """
    Parses an .aiinclude file to get inclusion and exclusion patterns.

    Args:
        aiinclude_path (str): Path to the .aiinclude file.

    Returns:
        tuple: A tuple containing two lists: (include_patterns, exclude_patterns).
               Each pattern is a raw string suitable for regex compilation.
    """
    include_patterns = []
    exclude_patterns = []

    if not os.path.exists(aiinclude_path):
        print(f"Warning: .aiinclude file not found at '{aiinclude_path}'. No patterns will be applied.")
        return [], []

    try:
        with open(aiinclude_path, "r") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue  # Skip empty lines

                # Split line by '#' to remove comments, then strip whitespace again
                line_without_comment = line.split("#", 1)[0].strip()

                if not line_without_comment:
                    continue  # Skip lines that are only comments or empty after stripping

                if line_without_comment.startswith("+ "):
                    pattern = line_without_comment[2:].strip()
                    if pattern:
                        include_patterns.append(pattern)
                elif line_without_comment.startswith("- "):
                    pattern = line_without_comment[2:].strip()
                    if pattern:
                        exclude_patterns.append(pattern)
                else:
                    print(
                        f"Warning: Line {line_num} in '{aiinclude_path}' has an unrecognized format: '{line}'. Skipping."
                    )
    except Exception as e:
        print(f"Error reading .aiinclude file '{aiinclude_path}': {e}")
        return [], []

    return include_patterns, exclude_patterns


def selective_clone(source_dir, dest_dir, include_patterns, exclude_patterns=None):
    """
    Clones a directory selectively, including only files and subfolders that match
    the specified include patterns and do not match exclude patterns.
    The destination directory will be recreated each time to ensure a clean copy.

    Args:
        source_dir (str): The path to the source directory to clone.
        dest_dir (str): The path to the destination directory where files will be copied.
        include_patterns (list): A list of raw string regex patterns for files/folders to include.
        exclude_patterns (list, optional): A list of raw string regex patterns for files/folders to exclude.
                                           If a file/folder matches an exclude pattern, it will be skipped
                                           even if it matches an include pattern.
    """
    if not os.path.exists(source_dir):
        print(f"Error: Source directory '{source_dir}' does not exist.")
        return

    # --- NEW: Remove destination directory if it exists to ensure a clean copy ---
    if os.path.exists(dest_dir):
        print(f"Clearing existing destination directory: '{dest_dir}'...")
        try:
            shutil.rmtree(dest_dir)
            print("Destination directory cleared.")
        except OSError as e:
            print(f"Error: Could not remove directory '{dest_dir}': {e}")
            print("Please ensure you have write permissions and no files are in use.")
            return

    # Create the destination directory
    os.makedirs(dest_dir, exist_ok=True)  # exist_ok=True is technically redundant here after rmtree but harmless
    print(f"Cloning from '{source_dir}' to '{dest_dir}' with specified includes/excludes...")

    # Compile regex patterns for efficiency
    compiled_include_patterns = [re.compile(p) for p in include_patterns]
    compiled_exclude_patterns = [re.compile(p) for p in (exclude_patterns if exclude_patterns else [])]

    # Helper function to check if an item should be excluded
    def should_exclude(item_name, item_path):
        # Always exclude the destination directory if it's nested within source (prevents infinite loop)
        # os.path.abspath is crucial here to compare absolute paths
        if os.path.abspath(item_path).startswith(os.path.abspath(dest_dir)):
            return True

        # Check against exclude patterns
        for pattern in compiled_exclude_patterns:
            # Check item name directly
            if pattern.search(item_name):
                print(f"DEBUG:     EXCLUDING '{item_name}' (matched name pattern: {pattern.pattern})")
                return True
            # Check relative path from source_dir for patterns like 'node_modules/'
            relative_path = os.path.relpath(item_path, source_dir)
            if pattern.search(relative_path):
                print(f"DEBUG:     EXCLUDING '{relative_path}' (matched path pattern: {pattern.pattern})")
                return True
        return False

    # Helper function to check if an item should be included
    def should_include(item_name, item_path):
        # If no include patterns are specified, everything is included by default,
        # unless it's explicitly excluded by should_exclude.
        if not compiled_include_patterns:
            return True

        # Check against include patterns
        for pattern in compiled_include_patterns:
            # Check item name directly
            if pattern.search(item_name):
                return True
            # Check relative path from source_dir
            relative_path = os.path.relpath(item_path, source_dir)
            if pattern.search(relative_path):
                return True
        return False

    # Perform the walk and copy operation
    for root, dirs, files in os.walk(source_dir):
        # Calculate the relative path from the source directory to the current root
        relative_path_from_source = os.path.relpath(root, source_dir)
        current_dest_subdir = os.path.join(dest_dir, relative_path_from_source)

        print(f"\nDEBUG: Currently at directory: {root}")
        print(f"DEBUG: Directories found: {dirs}")

        # --- Prune directories for traversal based on exclusion ---
        # Create a new list for dirs that should be traversed
        dirs_to_remove_from_traversal = []  # Collect names to remove later
        for d_name in list(dirs):  # Iterate over a copy to allow modification of 'dirs'
            dir_path = os.path.join(root, d_name)
            print(f"DEBUG:   Considering directory for exclusion/inclusion: '{d_name}' (Full path: '{dir_path}')")
            if should_exclude(d_name, dir_path):
                # If a directory is excluded, do not process its contents or traverse into it.
                # Mark it for removal from 'dirs' list so os.walk does not visit it.
                dirs_to_remove_from_traversal.append(d_name)
            else:
                # If a directory is NOT excluded, decide if it should be created in the destination.
                # It should be created if it's explicitly included OR if any of its files might be included.
                # For simplicity, we just create the *parent* structure for files.
                # Empty directories that are only included but have no included files will also be created.
                if should_include(d_name, dir_path):
                    os.makedirs(os.path.join(current_dest_subdir, d_name), exist_ok=True)
                    print(
                        f"DEBUG:     CREATED destination directory: '{os.path.join(relative_path_from_source, d_name)}'"
                    )

        # Now, modify 'dirs' in-place to prune the traversal,
        # after we've processed all directories at this level for creation.
        for d_remove in dirs_to_remove_from_traversal:
            if d_remove in dirs:  # Ensure it's still there before removing
                dirs.remove(d_remove)

        # --- Process files ---
        for file_name in files:
            file_path = os.path.join(root, file_name)
            dest_file_path = os.path.join(current_dest_subdir, file_name)
            print(f"DEBUG:   Considering file for exclusion/inclusion: '{file_name}' (Full path: '{file_path}')")

            # Exclusion has higher priority than inclusion
            if should_exclude(file_name, file_path):
                # Debug message for file exclusion is already in should_exclude
                continue

            # Check inclusion
            if should_include(file_name, file_path):
                # Ensure the destination subdirectory exists for the file
                os.makedirs(os.path.dirname(dest_file_path), exist_ok=True)
                shutil.copy2(file_path, dest_file_path)  # copy2 preserves metadata
                print(f"  Copied: {os.path.join(relative_path_from_source, file_name)}")
            else:
                print(f"DEBUG:     SKIPPING file (not included): '{file_name}'")

    print("\nSelective cloning complete!")


# --- Main execution block ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Selectively clone a folder based on .aiinclude patterns.")
    parser.add_argument("source_dir", help="The path to the source directory to clone.")
    parser.add_argument("dest_dir", help="The path to the destination directory where files will be copied.")
    parser.add_argument(
        "-c",
        "--config",
        default=".aiinclude",
        help="Path to the .aiinclude configuration file (default: ./.aiinclude).",
    )

    args = parser.parse_args()

    # Parse the .aiinclude file
    include_patterns, exclude_patterns = parse_aiinclude(args.config)
    print(f"DEBUG: Parsed Include Patterns: {include_patterns}")
    print(f"DEBUG: Parsed Exclude Patterns: {exclude_patterns}")

    # --- Create a dummy project structure for testing (optional, comment out for real use) ---
    # This part is just to make the example runnable without you needing to create files manually.
    # You can comment this out or remove it when using it with your actual project.
    DUMMY_SOURCE_FOLDER = "my_dummy_project"
    DUMMY_DEST_FOLDER = "gemini_upload_test"

    # Only create dummy data if explicitly using the dummy paths
    if args.source_dir == DUMMY_SOURCE_FOLDER and args.dest_dir == DUMMY_DEST_FOLDER:
        print("Creating dummy project structure for demonstration...")
        if os.path.exists(DUMMY_SOURCE_FOLDER):
            shutil.rmtree(DUMMY_SOURCE_FOLDER)  # Clean up previous dummy run
        # Removed dest_dir cleanup here to let the function handle it.

        # Create core dummy folders
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "src"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "node_modules"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, ".git"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "build"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "config"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "docs"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "public", "images"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "scripts"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "__pycache__"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "_site"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, ".jekyll-cache"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, ".github", "workflows"), exist_ok=True)

        # Add assets folder and its subfolders for testing specific scenario
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "css"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "js"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "images"), exist_ok=True)
        os.makedirs(
            os.path.join(DUMMY_SOURCE_FOLDER, "assets", "images", "full-res", "blog"), exist_ok=True
        )  # Nested for testing
        os.makedirs(
            os.path.join(DUMMY_SOURCE_FOLDER, "assets", "images", "processed"), exist_ok=True
        )  # Nested for testing
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "fonts"), exist_ok=True)  # Another assets subfolder

        # Create some dummy files to simulate your project
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "main.py"), "w") as f:
            f.write('print("Hello from main.py")')
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "app.js"), "w") as f:
            f.write('console.log("Hello from app.js")')
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "index.html"), "w") as f:
            f.write("<!DOCTYPE html><html><body></body></html>")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "style.css"), "w") as f:
            f.write("body { color: blue; }")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "README.md"), "w") as f:
            f.write("# My Project")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "LICENSE"), "w") as f:
            f.write("MIT License")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "package.json"), "w") as f:
            f.write("{}")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, ".env"), "w") as f:
            f.write("API_KEY=123")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "config", "settings.json"), "w") as f:
            f.write('{"debug": true}')
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "src", "component.py"), "w") as f:
            f.write("def func(): pass")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "src", "helper.js"), "w") as f:
            f.write("// helper js")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "node_modules", "some_lib", "index.js"), "w") as f:
            f.write("// node_module")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, ".git", "HEAD"), "w") as f:
            f.write("ref: refs/heads/main")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "build", "bundle.js"), "w") as f:
            f.write("// compiled bundle")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "public", "index.html"), "w") as f:
            f.write("<!DOCTYPE html><html><head><title>Public</title></head></html>")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "log.txt"), "w") as f:
            f.write("Some log entry.")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "scripts", "setup.sh"), "w") as f:
            f.write("#!/bin/bash")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "__pycache__", "main.cpython-39.pyc"), "w") as f:
            f.write("pyc data")

        # Add files for your specific project structure
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "favicon-16x16.png"), "w") as f:
            f.write("png data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "meet-maria.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "blog.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "favicon.ico"), "w") as f:
            f.write("ico data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, ".DS_Store"), "w") as f:
            f.write("ds store data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "android-chrome-192x192.png"), "w") as f:
            f.write("png data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "LICENSE"), "w") as f:
            f.write("MIT License")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "apple-touch-icon.png"), "w") as f:
            f.write("png data")
        with open(os.path.join(DUMPH_SOURCE_FOLDER, "privacy-policy.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "contact.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "CNAME"), "w") as f:
            f.write("CNAME")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "404.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "purgecss.config.js"), "w") as f:
            f.write("js data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "process_my_images.sh"), "w") as f:
            f.write("sh data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, ".aiinclude"), "w") as f:
            f.write("+ assets[\\\\/].*\n- assets[\\\\/]images[\\\\/].*")  # Minimal .aiinclude for testing
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "clone_project.py"), "w") as f:
            f.write("python data")  # Placeholder
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "android-chrome-512x512.png"), "w") as f:
            f.write("png data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "site.webmanifest"), "w") as f:
            f.write("manifest data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, ".gitignore"), "w") as f:
            f.write("gitignore data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "package-lock.json"), "w") as f:
            f.write("json data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "package.json"), "w") as f:
            f.write("json data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "index.md"), "w") as f:
            f.write("md data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "_config.yml"), "w") as f:
            f.write("yml data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "Gemfile"), "w") as f:
            f.write("Gemfile data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "Gemfile.lock"), "w") as f:
            f.write("Gemfile.lock data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "commands.txt"), "w") as f:
            f.write("txt data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "services.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "faq.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "service_areas.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "favicon-32x32.png"), "w") as f:
            f.write("png data")

        # Add files to assets subfolders
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "css", "style.css"), "w") as f:
            f.write("/* css */")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "js", "app.js"), "w") as f:
            f.write("// js")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "images", "header.png"), "w") as f:
            f.write("dummy image data 1")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "images", "icons", "icon.svg"), "w") as f:
            f.write("dummy icon data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "fonts", "font.ttf"), "w") as f:
            f.write("dummy font data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "images", "full-res", "blog", "image.jpeg"), "w") as f:
            f.write("image data")  # for deeper path testing
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "assets", "images", "processed", "image.webp"), "w") as f:
            f.write("processed image data")  # for deeper path testing

        # Add Jekyll related files
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "_includes", "head"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "_posts"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "_layouts"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "_data"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "_sass", "layout"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "_sass", "components"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "_sass", "base"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, ".jekyll-cache", "Jekyll"), exist_ok=True)
        os.makedirs(os.path.join(DUMMY_SOURCE_FOLDER, "_site", "assets"), exist_ok=True)  # To test _site exclusion

        with open(os.path.join(DUMMY_SOURCE_FOLDER, "_includes", "head", "custom.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "_posts", "my-post.md"), "w") as f:
            f.write("md data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "_layouts", "default.html"), "w") as f:
            f.write("html data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "_data", "config.yml"), "w") as f:
            f.write("yml data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "_sass", "main.scss"), "w") as f:
            f.write("scss data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, ".jekyll-cache", "cache.json"), "w") as f:
            f.write("json data")
        with open(os.path.join(DUMMY_SOURCE_FOLDER, "_site", "index.html"), "w") as f:
            f.write("html data")

        print("Dummy project created. Starting selective clone...")
        # --- Run the selective clone on dummy project ---
        selective_clone(DUMMY_SOURCE_FOLDER, DUMMY_DEST_FOLDER, include_patterns, exclude_patterns)

        # --- Verification (Optional) ---
        print("\n--- Verifying contents of destination folder ---")
        for root, dirs, files in os.walk(DUMMY_DEST_FOLDER):
            relative_path = os.path.relpath(root, DUMMY_DEST_FOLDER)
            print(f"Folder: {relative_path if relative_path != '.' else '/'}")
            for d in dirs:
                print(f"  Dir: {d}")
            for f in files:
                print(f"  File: {f}")

        # print("\n--- Cleaning up dummy project structure (optional) ---")
        # shutil.rmtree(DUMMY_SOURCE_FOLDER)
        # shutil.rmtree(DUMMY_DEST_FOLDER)
        # print("Cleaned up dummy project and destination folders.")

    else:
        # --- Run the selective clone on actual project ---
        selective_clone(args.source_dir, args.dest_dir, include_patterns, exclude_patterns)
