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

DRY_RUN=false 
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
# Find command updated to include webp and match common extensions
find "$SOURCE_BASE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -print0 | while IFS= read -r -d $'\0' source_image_path; do
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

    # --- UPDATED: Universal Responsive Generation ---
    # We generate 400 and 800 widths for ALL images now, not just blog
    echo "  -> Generating responsive sizes (400px, 800px)..."
    for width in 400 800; do
        local_avif_path="${current_output_dir}/${base_name}-${width}.avif"
        local_webp_path="${current_output_dir}/${base_name}-${width}.webp"
        
        # Optional: Generate a small JPG/PNG fallback if needed, but usually WebP/AVIF is enough for srcset
        # local_fallback_path="${current_output_dir}/${base_name}-${width}.${extension_lower}"

        # Create AVIF and WebP for the current size
        # We use > to ensure we don't upscale small images
        avif_resize_cmd="magick \"$source_image_path\" -resize '${width}>' +profile \"*\" -quality $IM_AVIF_QUALITY \"$local_avif_path\""
        webp_resize_cmd="magick \"$source_image_path\" -resize '${width}>' -quality $IM_WEBP_QUALITY \"$local_webp_path\""

        if [ "$DRY_RUN" = false ]; then
            eval "$avif_resize_cmd"
            eval "$webp_resize_cmd"
        fi
    done
    # --- END: NEW LOGIC ---

    # --- Standard processing for the largest (1600px max) version ---
    echo "  -> Generating max-width ($UNIVERSAL_MAX_WIDTH px) versions..."
    
    avif_output_path="${current_output_dir}/${base_name}.avif"
    webp_output_path="${current_output_dir}/${base_name}.webp"
    fallback_output_path="${current_output_dir}/${base_name}.${extension_lower}"
    
    temp_resized_image_path="${current_output_dir}/${base_name}_resized_temp.$extension_lower"
    magick "$source_image_path" -resize "${UNIVERSAL_MAX_WIDTH}>" "$temp_resized_image_path"
    magick "$temp_resized_image_path" +profile "*" -quality $IM_AVIF_QUALITY "$avif_output_path"
    magick "$temp_resized_image_path" +profile "*" -quality $IM_WEBP_QUALITY "$webp_output_path"
    
    if [[ "$extension_lower" =~ ^(jpg|jpeg)$ ]]; then
        magick "$temp_resized_image_path" +profile "*" -define jpeg:extent=${JPEG_FALLBACK_TARGET_SIZE_KB}KB -quality $JPEG_FALLBACK_QUALITY "$fallback_output_path"
    elif [[ "$extension_lower" == "png" ]]; then
        cp "$temp_resized_image_path" "$fallback_output_path"
        if [ "$USE_PNGQUANT" = true ] && command -v pngquant &>/dev/null; then
            pngquant --force --skip-if-larger --quality=$PNGQUANT_QUALITY --output "$fallback_output_path" "$fallback_output_path"
        fi
    fi
    
    rm "$temp_resized_image_path"
    
    echo "  -> Processing complete for $filename"
    echo "---"

done

echo "Bulk image conversion script finished."