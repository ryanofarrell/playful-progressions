#!/bin/bash

# --- Configuration ---
# Directory containing your source images (e.g., assets/images/blog/full-res/)
SOURCE_DIR="assets/images/blog/full-res"

# Directory where optimized images will be saved (e.g., assets/images/blog/)
OUTPUT_DIR="assets/images/blog"

# Quality settings (0-100 for ImageMagick, higher is better quality)
WEBP_QUALITY=85
AVIF_QUALITY=85

# Settings for the "smallified" original image
SMALL_MAX_DIMENSION=800 # Max width or height for the smallified image
SMALL_JPG_QUALITY=80 # Quality for smallified JPG compression (0-100) - Applies only to JPGs

# Set this to 'true' for dry run, 'false' for actual execution
DRY_RUN=true
# ---------------------

echo "--- Running Bulk Image Conversion Script (Using ImageMagick, Dry Run: $DRY_RUN) ---"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' not found."
    exit 1
fi

# Check if output directory exists, create if not
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "Output directory '$OUTPUT_DIR' not found, creating it."
    mkdir -p "$OUTPUT_DIR"
fi

# Check if ImageMagick's magick command is available
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick 'magick' command not found."
    echo "Please install ImageMagick (v7+ recommended) and its delegates (libwebp, libavif)."
    echo "On Debian/Ubuntu: sudo apt install imagemagick libwebp-dev libavif-dev"
    echo "On macOS (Homebrew): brew install imagemagick webp libavif"
    exit 1
fi

# Find all JPG, JPEG, and PNG files in the source directory and loop through them
find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | while IFS= read -r -d $'\0' source_image; do
    # Get the directory and base name without extension from the SOURCE_IMAGE
    dir=$(dirname "$source_image")
    filename=$(basename "$source_image")
    base_name="${filename%.*}" # Remove extension
    extension="${filename##*.}" # Get extension
    extension_lower=$(echo "$extension" | tr '[:upper:]' '[:lower:]') # Ensure lowercase extension for output filename

    # Define output paths in the OUTPUT_DIR
    webp_output="$OUTPUT_DIR/$base_name.webp"
    avif_output="$OUTPUT_DIR/$base_name.avif"
    small_output="$OUTPUT_DIR/$base_name-small.$extension_lower"

    echo "Processing $source_image..."

    # --- Create WebP Version ---
    # Using 'magick convert' for IMv7 compatibility
    webp_command="magick convert \"$source_image\" -quality $WEBP_QUALITY \"$webp_output\""
    if [ "$DRY_RUN" = true ]; then
        echo "  Would create WebP: $webp_command"
    else
        echo "  Creating WebP..."
        if $webp_command; then
            echo "  -> Created $webp_output"
        else
            echo "  -> Failed to create $webp_output. Ensure ImageMagick supports WebP."
        fi
    fi

    # --- Create AVIF Version ---
    # Using 'magick convert' for IMv7 compatibility
    avif_command="magick convert \"$source_image\" -quality $AVIF_QUALITY \"$avif_output\""
     if [ "$DRY_RUN" = true ]; then
        echo "  Would create AVIF: $avif_command"
    else
         echo "  Creating AVIF..."
        if $avif_command; then
             echo "  -> Created $avif_output"
         else
             echo "  -> Failed to create $avif_output. Ensure ImageMagick supports AVIF (check delegates like libavif)."
         fi
    fi

    # --- Create Smallified Original Version ---
    small_command="" # Initialize command

    # Command depends on the original file type for quality setting
    if [[ "$extension_lower" =~ ^(jpg|jpeg)$ ]]; then
        # For JPG/JPEG, resize and apply quality
        # Using 'magick convert' for IMv7 compatibility
        small_command="magick convert \"$source_image\" -resize ${SMALL_MAX_DIMENSION}x${SMALL_MAX_DIMENSION}\> -quality $SMALL_JPG_QUALITY \"$small_output\""
    elif [[ "$extension_lower" == "png" ]]; then
        # For PNG, resize only
        # Using 'magick convert' for IMv7 compatibility
        small_command="magick convert \"$source_image\" -resize ${SMALL_MAX_DIMENSION}x${SMALL_MAX_DIMENSION}\> \"$small_output\""
    else
        echo "  Skipping smallified version for unsupported format: $extension"
    fi

    # Only run the smallified command if it was successfully set
    if [ -n "$small_command" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo "  Would create smallified original: $small_command"
        else
             echo "  Creating smallified original..."
            if $small_command; then
                echo "  -> Created $small_output"
            else
                echo "  -> Failed to create $small_output."
            fi
        fi
    fi


    echo "---"
done

echo "Bulk image conversion script finished."