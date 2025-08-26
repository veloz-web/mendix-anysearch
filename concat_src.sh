#!/bin/bash

# Script to concatenate all files in /src into src.txt
# Usage: ./concat_src.sh

SRC_DIR="./src"
OUTPUT_FILE="src.txt"

# Check if src directory exists
if [ ! -d "$SRC_DIR" ]; then
    echo "Error: $SRC_DIR directory not found"
    exit 1
fi

# Remove output file if it exists
[ -f "$OUTPUT_FILE" ] && rm "$OUTPUT_FILE"

# Counter for files processed
file_count=0

# Function to process files recursively
process_files() {
    local dir="$1"
    local first_file="$2"
    
    # Find all files (not directories) and sort them
    while IFS= read -r -d '' file; do
        # Add line break before each file (except the first one)
        if [ "$first_file" = false ]; then
            echo "" >> "$OUTPUT_FILE"
        fi
        
        # Add file header with path
        echo "=== $file ===" >> "$OUTPUT_FILE"
        
        # Add file content
        if [ -r "$file" ]; then
            cat "$file" >> "$OUTPUT_FILE"
            # Add newline if file doesn't end with one
            if [ -s "$file" ] && [ "$(tail -c1 "$file")" != "" ]; then
                echo "" >> "$OUTPUT_FILE"
            fi
        else
            echo "[Error reading file: Permission denied]" >> "$OUTPUT_FILE"
        fi
        
        ((file_count++))
        first_file=false
    done < <(find "$dir" -type f -print0 | sort -z)
}

# Process all files
echo "Processing files in $SRC_DIR..."
process_files "$SRC_DIR" true

echo "Successfully concatenated $file_count files to $OUTPUT_FILE"
