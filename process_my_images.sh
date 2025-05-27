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
USE_PNGQUANT=false
PNGQUANT_QUALITY="65-80"

DRY_RUN=false # Keep true for initial testing
# ---------------------

echo "--- Running Bulk Image Conversion Script (Corrected Command Substitution) ---"
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
    image_subdir=$(dirname "$relative_image_path") # CORRECTED
    filename=$(basename "$source_image_path")     # CORRECTED
    base_name="${filename%.*}"
    extension_lower=$(echo "${filename##*.}" | tr '[:upper:]' '[:lower:]') # CORRECTED

    current_output_dir="$OUTPUT_BASE_DIR"
    if [ "$image_subdir" != "." ] && [ "$image_subdir" != "$SOURCE_BASE_DIR" ]; then
        current_output_dir="$OUTPUT_BASE_DIR/$image_subdir"
    fi

    if [ ! -d "$current_output_dir" ]; then
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$current_output_dir"
        else
            echo "  Would create directory: $current_output_dir"
        fi
    fi

    temp_resized_image_path="${current_output_dir}/${base_name}_resized_temp.$extension_lower"
    webp_output_path="${current_output_dir}/${base_name}.webp"
    avif_output_path="${current_output_dir}/${base_name}.avif"
    fallback_output_path="${current_output_dir}/${base_name}.$extension_lower"

    echo
    echo "Processing $source_image_path..."
    echo "  Outputting to $current_output_dir"

    resize_command="magick \"$source_image_path\" -resize '${UNIVERSAL_MAX_WIDTH}>' \"$temp_resized_image_path\""
    effective_source_for_conversion="$source_image_path"

    if [ "$DRY_RUN" = true ]; then
        echo "  Would resize: $resize_command"
    else
        echo "  Resizing to max width $UNIVERSAL_MAX_WIDTH (if larger)..."
        if magick "$source_image_path" -resize "${UNIVERSAL_MAX_WIDTH}>" "$temp_resized_image_path"; then
            echo "  -> Resized temp file: $temp_resized_image_path"
            effective_source_for_conversion="$temp_resized_image_path"
        else
            echo "  -> Failed to resize or image is smaller. Copying original to temp location for processing." >&2
            cp "$source_image_path" "$temp_resized_image_path"
            effective_source_for_conversion="$temp_resized_image_path"
        fi
    fi

    if [ "$USE_CWEBP" = true ] && command -v cwebp &>/dev/null; then
        webp_command="cwebp \"$effective_source_for_conversion\" -size $CWEBP_TARGET_SIZE_BYTES -q $CWEBP_QUALITY -o \"$webp_output_path\""
    else
        webp_command="magick \"$effective_source_for_conversion\" -quality $IM_WEBP_QUALITY \"$webp_output_path\""
    fi
    if [ "$DRY_RUN" = true ]; then
        echo "  Would create WebP: $webp_command"
    else
        echo "  Creating WebP..."
        if eval "$webp_command"; then
            echo "  -> Created $webp_output_path"
        else
            echo "  -> Failed to create $webp_output_path" >&2
        fi
    fi

    avif_command="magick \"$effective_source_for_conversion\" +profile \"*\" -quality $IM_AVIF_QUALITY \"$avif_output_path\""
    if [ "$DRY_RUN" = true ]; then
        echo "  Would create AVIF: $avif_command"
    else
        echo "  Creating AVIF..."
        if eval "$avif_command"; then
            echo "  -> Created $avif_output_path"
        else
            echo "  -> Failed to create $avif_output_path" >&2
        fi
    fi

    fallback_command_action=""
    fallback_command=""

    if [[ "$extension_lower" =~ ^(jpg|jpeg)$ ]]; then
        fallback_command="magick \"$effective_source_for_conversion\" +profile \"*\" -define jpeg:extent=${JPEG_FALLBACK_TARGET_SIZE_KB}KB -quality $JPEG_FALLBACK_QUALITY \"$fallback_output_path\""
        fallback_command_action="Creating JPEG fallback"
    elif [[ "$extension_lower" == "png" ]]; then
        if [ "$DRY_RUN" = false ]; then
            if [ "$effective_source_for_conversion" != "$fallback_output_path" ]; then # Avoid copying onto itself if no resize happened
                 cp "$effective_source_for_conversion" "$fallback_output_path"
            fi
            echo "  -> Copied/prepared $fallback_output_path for PNG optimization"
        else
            echo "  Would copy/prepare $effective_source_for_conversion to $fallback_output_path for PNG optimization"
        fi
        
        if [ "$USE_PNGQUANT" = true ] && command -v pngquant &>/dev/null; then
            fallback_command="pngquant --force --skip-if-larger --quality=$PNGQUANT_QUALITY --output \"$fallback_output_path\" \"$fallback_output_path\""
            fallback_command_action="Optimizing PNG with pngquant"
        elif [ "$USE_OPTIPNG" = true ] && command -v optipng &>/dev/null; then
            fallback_command="optipng -o2 \"$fallback_output_path\""
            fallback_command_action="Optimizing PNG with optipng"
        else
            fallback_command_action="Skipping further PNG optimization (no tool or not enabled for PNG)"
        fi
    fi

    if [ -n "$fallback_command" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo "  Would perform: $fallback_command_action: $fallback_command"
        else
            echo "  $fallback_command_action..."
            if eval "$fallback_command"; then
                echo "  -> Fallback $fallback_output_path processed"
            else
                echo "  -> Failed: $fallback_command_action" >&2
            fi
        fi
    elif [ -n "$fallback_command_action" ]; then 
        echo "  $fallback_command_action"
    fi
    
    if [ "$DRY_RUN" = false ] && [ "$effective_source_for_conversion" == "$temp_resized_image_path" ] && [ -f "$temp_resized_image_path" ]; then
      if [ "$temp_resized_image_path" != "$fallback_output_path" ] || [ "$source_image_path" != "$effective_source_for_conversion" ]; then
        rm "$temp_resized_image_path"
        echo "  -> Cleaned up temporary file: $temp_resized_image_path"
      fi
    fi
    echo "---"
done

echo "Bulk image conversion script finished."