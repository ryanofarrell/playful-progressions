#!/bin/bash

# --- Configuration ---
SOURCE_BASE_DIR="assets/images/full-res"
OUTPUT_BASE_DIR="assets/images/processed"

# --- Image Processing Settings ---
UNIVERSAL_MAX_WIDTH="1600"

IM_WEBP_QUALITY="75"
IM_AVIF_QUALITY="60"

USE_CWEBP=true
CWEBP_TARGET_SIZE_BYTES="80000"
CWEBP_QUALITY="75"

JPEG_FALLBACK_QUALITY="80"
JPEG_FALLBACK_TARGET_SIZE_KB="100"

USE_OPTIPNG=false
USE_PNGQUANT=true
PNGQUANT_QUALITY="65-80"

DRY_RUN=false # Keep true for initial testing
# ---------------------

# --- Helper function to get file size reliably on both macOS and Linux ---
get_size() {
    if [[ "$(uname -s)" == "Darwin" ]]; then
        stat -f %z "$1" # macOS stat command
    else
        stat -c %s "$1" # Linux stat command
    fi
}
# --- End of Helper function ---

echo "--- Running Bulk Image Conversion Script ---"
echo "Source Dir: $SOURCE_BASE_DIR"
echo "Output Dir: $OUTPUT_BASE_DIR"
echo "Universal Max Width: $UNIVERSAL_MAX_WIDTH"
echo "Dry Run: $DRY_RUN"
echo "---"

# Dependency Checks
if ! command -v magick &>/dev/null; then
    echo "Error: ImageMagick 'magick' command not found." >&2
    exit 1
fi
if [ "$USE_CWEBP" = true ] && ! command -v cwebp &>/dev/null; then
    echo "Warning: cwebp command not found, USE_CWEBP is true. Falling back to ImageMagick for WebP." >&2
    USE_CWEBP=false
fi
if [ "$USE_OPTIPNG" = true ] && ! command -v optipng &>/dev/null; then
    echo "Warning: optipng command not found, USE_OPTIPNG is true. Skipping optipng." >&2
    USE_OPTIPNG=false
fi
if [ "$USE_PNGQUANT" = true ] && ! command -v pngquant &>/dev/null; then
    echo "Warning: pngquant command not found, USE_PNGQUANT is true. Skipping pngquant." >&2
    USE_PNGQUANT=false
fi


find "$SOURCE_BASE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | while IFS= read -r -d $'\0' source_image_path; do
    relative_image_path="${source_image_path#$SOURCE_BASE_DIR/}"
    image_subdir=$(dirname "$relative_image_path")
    filename=$(basename "$source_image_path")
    base_name="${filename%.*}"
    extension_lower=$(echo "${filename##*.}" | tr '[:upper:]' '[:lower:]')

    current_output_dir="$OUTPUT_BASE_DIR"
    if [ "$image_subdir" != "." ] && [ "$image_subdir" != "$SOURCE_BASE_DIR" ]; then
        current_output_dir="$OUTPUT_BASE_DIR/$image_subdir"
    fi

    if [ ! -d "$current_output_dir" ]; then
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$current_output_dir"
        fi
    fi

    echo
    echo "Processing $source_image_path..."

    # --- START: NEW LOGIC FOR BLOG-SPECIFIC RESIZING ---
    if [[ "$relative_image_path" == blog/* ]]; then
        echo "  -> Blog image detected. Generating responsive sizes..."
        for width in 400 800; do
            local_avif_path="${current_output_dir}/${base_name}-${width}.avif"
            local_webp_path="${current_output_dir}/${base_name}-${width}.webp"
            local_fallback_path="${current_output_dir}/${base_name}-${width}.${extension_lower}"

            echo "     - Creating versions for ${width}px width..."

            # Create AVIF, WebP, and Fallback for the current size
            avif_resize_cmd="magick \"$source_image_path\" -resize '${width}>' +profile \"*\" -quality $IM_AVIF_QUALITY \"$local_avif_path\""
            webp_resize_cmd="magick \"$source_image_path\" -resize '${width}>' -quality $IM_WEBP_QUALITY \"$local_webp_path\""
            fallback_resize_cmd="magick \"$source_image_path\" -resize '${width}>' +profile \"*\" -quality $JPEG_FALLBACK_QUALITY \"$local_fallback_path\""

            if [ "$DRY_RUN" = false ]; then
                eval "$avif_resize_cmd"
                eval "$webp_resize_cmd"
                eval "$fallback_resize_cmd"
            else
                echo "       - Would run: $avif_resize_cmd"
                echo "       - Would run: $webp_resize_cmd"
                echo "       - Would run: $fallback_resize_cmd"
            fi
        done
    fi
    # --- END: NEW LOGIC ---

    # --- Standard processing for the largest (1600px max) version ---
    echo "  -> Generating max-width ($UNIVERSAL_MAX_WIDTH px) versions..."
    
    # Define paths for the max-width version
    avif_output_path="${current_output_dir}/${base_name}.avif"
    webp_output_path="${current_output_dir}/${base_name}.webp"
    fallback_output_path="${current_output_dir}/${base_name}.${extension_lower}"
    
    # Use a temporary file for resizing to avoid re-reading the large original
    temp_resized_image_path="${current_output_dir}/${base_name}_resized_temp.$extension_lower"
    magick "$source_image_path" -resize "${UNIVERSAL_MAX_WIDTH}>" "$temp_resized_image_path"
    
    # Generate formats from the resized temporary file
    magick "$temp_resized_image_path" +profile "*" -quality $IM_AVIF_QUALITY "$avif_output_path"
    magick "$temp_resized_image_path" -quality $IM_WEBP_QUALITY "$webp_output_path"
    
    # Handle original fallback (JPEG or PNG)
    if [[ "$extension_lower" =~ ^(jpg|jpeg)$ ]]; then
        magick "$temp_resized_image_path" +profile "*" -define jpeg:extent=${JPEG_FALLBACK_TARGET_SIZE_KB}KB -quality $JPEG_FALLBACK_QUALITY "$fallback_output_path"
    elif [[ "$extension_lower" == "png" ]]; then
        cp "$temp_resized_image_path" "$fallback_output_path"
        if [ "$USE_PNGQUANT" = true ] && command -v pngquant &>/dev/null; then
            pngquant --force --skip-if-larger --quality=$PNGQUANT_QUALITY --output "$fallback_output_path" "$fallback_output_path"
        fi
    fi
    
    # Clean up the temporary file
    rm "$temp_resized_image_path"
    
    echo "  -> Max-width versions created."
    echo "---"

done

echo "Bulk image conversion script finished."