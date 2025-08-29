#!/bin/bash

# A shell script that intelligently combines text files.
# - If SEARCH_DIRS is set to just "./", it will only process files in the root directory.
# - Otherwise, it will RECURSIVELY search the specified directories,
#   excluding any folders listed in EXCLUDE_DIRS.

# --- Configuration ---
# 1. Add paths to search. For recursive search, use specific folders.
#    To search ONLY the root directory (non-recursively), set this to: SEARCH_DIRS=("./")
SEARCH_DIRS=(".")

# 2. List of directory names to EXCLUDE during a recursive search.
#    This is ignored for a root-only search.
EXCLUDE_DIRS=("node_modules" ".git" "dist" "build" "venv" "_site" ".sass-cache" ".jekyll-cache" ".vscode")

# 3. The name of the final combined file.
OUTPUT_FILE="combined_output_recursive.txt"

# 4. List of file extensions to INCLUDE in the combination.
FILE_EXTENSIONS=(".md" ".txt" ".py" ".html" ".css" ".js" ".json" ".xml" ".sh" ".yml" ".sass" ".scss")

# 5. List of specific filenames to EXCLUDE.
EXCLUDE_FILES=("bootstrap.bundle.min.js" "bootstrap.min.js" "jquery.min.js" "jquery.slim.min.js" "package-lock.json")
# --- End of Configuration ---


# --- Helper Function ---
# This function handles writing a file's content to the output file.
# It prevents duplicating the main logic.
process_file() {
  local file_to_process="$1"
  local abs_current_file
  abs_current_file="$(readlink -f "$file_to_process")"

  # Ensure we don't add the output file itself to the combination.
  if [ "$abs_current_file" != "$ABS_OUTPUT_FILE" ]; then
    echo "  -> Adding content from: $file_to_process"

    # Append a header and the file content to the output file.
    echo "--- START OF FILE: $file_to_process ---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    cat "$file_to_process" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "--- END OF FILE: $file_to_process ---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"; echo "" >> "$OUTPUT_FILE"
  fi
}
# --- End of Helper Function ---


# Get the absolute path of the output file for reliable comparison.
ABS_OUTPUT_FILE="$(readlink -f "$OUTPUT_FILE")"

# Clear the output file to start fresh.
echo "Creating or clearing the output file: $OUTPUT_FILE"
> "$OUTPUT_FILE"


# --- Main Logic ---
# Check if we should do a root-only or a recursive search.
if [ ${#SEARCH_DIRS[@]} -eq 1 ] && [ "${SEARCH_DIRS[0]}" == "./" ]; then
  # --- Non-Recursive (Root Directory Only) ---
  echo "Starting non-recursive search in the root directory..."
  for item in *; do
    # Add this check to skip excluded files
    [[ " ${EXCLUDE_FILES[@]} " =~ " ${item} " ]] && continue
    # Check if the item is a file (and not a directory).
    if [ -f "$item" ]; then
      # Check if the file has one of the desired extensions.
      for ext in "${FILE_EXTENSIONS[@]}"; do
        if [[ "$item" == *"$ext" ]]; then
          process_file "$item"
          break # Move to the next item once an extension is matched.
        fi
      done
    fi
  done
else
  # --- Recursive Search in Specified Directories ---
  echo "Starting recursive search in specified directories..."

  # Build the 'find' command arguments for extensions.
  ext_args=()
  first_ext=true
  for ext in "${FILE_EXTENSIONS[@]}"; do
    [ "$first_ext" = false ] && ext_args+=(-o)
    ext_args+=(-name "*$ext")
    first_ext=false
  done

  # Build the full 'find' command array, including exclusions.
  find_command=("find" "${SEARCH_DIRS[@]}")
  for dir in "${EXCLUDE_DIRS[@]}"; do
    find_command+=(-path "*/$dir" -prune -o)
  done
  # --- ADD THIS BLOCK TO EXCLUDE SPECIFIC FILES ---
  for filename in "${EXCLUDE_FILES[@]}"; do
    find_command+=(-not -name "$filename")
  done
  # --- END OF NEW BLOCK ---
  find_command+=(-type f \()
  find_command+=("${ext_args[@]}")
  find_command+=(\) -print0)

  # Execute the find command and process each found file.
  "${find_command[@]}" | while IFS= read -r -d $'\0' file; do
    process_file "$file"
  done
fi

echo "Combination complete! All content is in $OUTPUT_FILE"