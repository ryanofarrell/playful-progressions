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

    # Remove destination directory if it exists to ensure a clean copy
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
    os.makedirs(dest_dir, exist_ok=True)
    print(f"Cloning from '{source_dir}' to '{dest_dir}' with specified includes/excludes...")

    # Compile regex patterns for efficiency
    compiled_include_patterns = [re.compile(p) for p in include_patterns]
    compiled_exclude_patterns = [re.compile(p) for p in (exclude_patterns if exclude_patterns else [])]

    # Helper function to check if an item should be excluded
    def should_exclude(item_name, item_path):
        # Always exclude the destination directory if it's nested within source (prevents infinite loop)
        if os.path.abspath(item_path).startswith(os.path.abspath(dest_dir)):
            return True

        # Check against exclude patterns (by item name or relative path)
        for pattern in compiled_exclude_patterns:
            if pattern.search(item_name):
                print(f"DEBUG:     EXCLUDING '{item_name}' (matched name pattern: {pattern.pattern})")
                return True
            relative_path = os.path.relpath(item_path, source_dir)
            if pattern.search(relative_path):
                print(f"DEBUG:     EXCLUDING '{relative_path}' (matched path pattern: {pattern.pattern})")
                return True
        return False

    # Helper function to check if an item should be included
    def should_include(item_name, item_path):
        # If no include patterns are specified, everything is included by default,
        # unless it's explicitly excluded (handled by should_exclude).
        if not compiled_include_patterns:
            return True

        # Check against include patterns (by item name or relative path)
        for pattern in compiled_include_patterns:
            if pattern.search(item_name):
                return True
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

        # --- Process directories for traversal and creation ---
        # We'll build a new list of directories for os.walk to traverse,
        # ensuring excluded directories are removed.
        new_dirs_for_walk = []
        for d_name in list(dirs):  # Iterate over a copy to safely modify 'dirs'
            dir_path = os.path.join(root, d_name)
            print(f"DEBUG:   Considering directory: '{d_name}' (Full path: '{dir_path}')")

            # EXCLUSION HAS ABSOLUTE PRECEDENCE
            if should_exclude(d_name, dir_path):
                print(f"DEBUG:     EXCLUDING directory '{d_name}' from traversal and creation.")
                # This directory will not be added to new_dirs_for_walk,
                # effectively pruning it from os.walk's future traversal.
                continue  # Skip all further processing for this directory

            # If not excluded, then consider it for inclusion and traversal
            new_dirs_for_walk.append(d_name)  # Add to list for os.walk's next iteration

            # If this non-excluded directory is also explicitly included, create it now.
            # Files will ensure their parent directories are created later, so this
            # primarily ensures explicitly included *empty* directories are copied.
            if should_include(d_name, dir_path):
                dest_dir_path = os.path.join(current_dest_subdir, d_name)
                os.makedirs(dest_dir_path, exist_ok=True)
                print(f"DEBUG:     CREATED destination directory: '{os.path.join(relative_path_from_source, d_name)}'")
            else:
                print(
                    f"DEBUG:     SKIPPING creation of directory (not explicitly included, but may contain included files): '{d_name}'"
                )

        # Update the 'dirs' list in-place to control os.walk's traversal
        dirs[:] = new_dirs_for_walk

        # --- Process files ---
        for file_name in files:
            file_path = os.path.join(root, file_name)
            dest_file_path = os.path.join(current_dest_subdir, file_name)
            print(f"DEBUG:   Considering file: '{file_name}' (Full path: '{file_path}')")

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

    # --- Run the selective clone on actual project ---
    selective_clone(args.source_dir, args.dest_dir, include_patterns, exclude_patterns)
