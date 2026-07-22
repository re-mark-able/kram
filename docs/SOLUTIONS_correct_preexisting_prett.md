import os
from pathlib import Path

def normalize_line_endings(root_dir: str = ".") -> int:
    """
    Recursively traverses a directory and normalizes all text files 
    by ensuring they use consistent LF line endings (\n).
    This simulates the deep cleanup necessary for mixed CRLF/LF errors.
    """
    total_files_processed = 0

    print(f"--- Starting Line Ending Normalization in: {os.path.abspath(root_dir)} ---")

    for root, _, files in os.walk(root_dir):
        for filename in files:
            file_path = Path(root) / filename
            # Restrict processing to common source code file types
            if file_path.suffix in ['.js', '.ts', '.json', '.md', '.py']:
                try:
                    # Read the content as raw bytes/text, minimizing OS-level assumption
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Normalize all detected line endings to LF (\n)
                    # This handles both \r\n (CRLF) and ensures consistency
                    normalized_content = content.replace('\r\n', '\n').replace('\r', '\n')

                    if normalized_content != content:
                        print(f"[FIXED] Normalized line endings in: {file_path}")
                        # Write the clean, LF-only version back to the file
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(normalized_content)
                        total_files_processed += 1
                    else:
                         print(f"[SKIP] {file_path} was already correctly formatted.")

                except UnicodeDecodeError:
                    # Skip binary files or poorly encoded files
                    pass
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    print("\n--- Normalization Complete ---")
    return total_files_processed

if __name__ == "__main__":
    try:
        files_fixed = normalize_line_endings()
        print(f"\nSuccessfully processed and normalized line endings in {files_fixed} files.")
        print("NOTE: After running this script, remember to stage all changes (git add .) and commit.")
    except Exception as e:
        print(f"A critical error occurred: {e}")
