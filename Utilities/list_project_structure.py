#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Generates a Markdown file representing a project directory structure as a
nested list. Excludes specified directories and includes only specified
file extensions based on command-line arguments or defaults.
"""

import argparse
import logging
import sys
from pathlib import Path

# --- Constants ---
# Default indentation string (two spaces per level)
DEFAULT_INDENT_SPACES = "  "

# --- Logging Setup ---
log = logging.getLogger(__name__)
# Basic configuration will be done in main()

# --- Core Logic ---

def process_directory(current_dir: Path, level: int, output_fh,
                      exclude_dirs: set, allowed_exts: set, indent_unit: str):
    """
    Recursively processes a directory, writing its structure to the output file handle.

    Args:
        current_dir: Path object for the directory to process.
        level: Current recursion depth (integer, starting from 0).
        output_fh: File handle for the output Markdown file.
        exclude_dirs: Set of lowercase directory names to exclude.
        allowed_exts: Set of lowercase file extensions (with dot) to include.
        indent_unit: String used for one level of indentation.
    """
    # Calculate indentation string for the current level
    current_indent = indent_unit * level
    files = []
    dirs = []

    try:
        # Separate files and directories, handle potential access errors
        for item in current_dir.iterdir():
            if item.is_dir():
                dirs.append(item)
            elif item.is_file():
                files.append(item)
    except PermissionError:
        log.warning(f"Permission denied reading directory: {current_dir}. Skipping.")
        output_fh.write(f"{current_indent}- *[Skipped: Permission Denied reading {current_dir.name}]*\n")
        return
    except OSError as e:
        log.warning(f"Could not read directory {current_dir}. Skipping. Error: {e}")
        output_fh.write(f"{current_indent}- *[Skipped: Error reading {current_dir.name}]*\n")
        return

    # Sort files alphabetically (case-insensitive)
    files.sort(key=lambda p: p.name.lower())
    # Sort directories alphabetically (case-insensitive)
    dirs.sort(key=lambda p: p.name.lower())

    # --- Process Files First ---
    for file_item in files:
        # Check if the file extension is allowed (case-insensitive)
        if file_item.suffix.lower() in allowed_exts:
            output_fh.write(f"{current_indent}- {file_item.name}\n")

    # --- Process Directories Second ---
    for dir_item in dirs:
        # Check if the directory name should be excluded (case-insensitive)
        if dir_item.name.lower() not in exclude_dirs:
            # Write directory name (bold)
            output_fh.write(f"{current_indent}- **{dir_item.name}**\n")
            # Recursively call for the subdirectory with increased level
            process_directory(dir_item, level + 1, output_fh,
                              exclude_dirs, allowed_exts, indent_unit)
        else:
            log.debug(f"Excluding directory: {dir_item}")


def main():
    """Main execution function: parses arguments and initiates processing."""

    # --- Default Configurations ---
    DEFAULT_EXCLUDE_DIRS = ".git,.vs,.cursor,.github,.vscode,migrations,obj,bin,pkg,lib,node_modules,properties,testresults,coveragereports,uploads"
    DEFAULT_ALLOWED_EXTS = ".md,.slnx,.sln,.csproj,.cs,.razor,.json,.xml,.vbproj,.fsproj,.shproj,.proj,.props,.targets,.nuspec,.config,.settings,.resx,.runsettings,.ruleset,.pubxml,.xdt,.vcxproj.filter,.py,.cmd,.sh"

    # --- Argument Parsing ---
    parser = argparse.ArgumentParser(
        description="Generate a Markdown project structure list.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter # Show defaults in help
    )
    parser.add_argument(
        "start_dir",
        nargs='?', # Makes the argument optional
        default='.', # Default to current directory
        help="The starting directory to process."
    )
    parser.add_argument(
        "-o", "--output",
        default="Design/PROJECT_STRUCTURE.md",
        help="Path to the output Markdown file."
    )
    parser.add_argument(
        "--exclude-dirs",
        default=DEFAULT_EXCLUDE_DIRS,
        help="Comma-separated list of directory names to exclude (case-insensitive)."
    )
    parser.add_argument(
        "--allowed-exts",
        default=DEFAULT_ALLOWED_EXTS,
        help="Comma-separated list of file extensions to include (case-insensitive, include the dot)."
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=2,
        help="Number of spaces per indentation level."
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose (DEBUG) logging."
    )

    args = parser.parse_args()

    # --- Setup Logging ---
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format='%(levelname)s: %(message)s', stream=sys.stderr)

    # --- Process Arguments ---
    start_path = Path(args.start_dir)
    output_file_path = Path(args.output)
    # Convert comma-separated strings from args to sets of lowercase strings
    exclude_dirs_set = {d.strip().lower() for d in args.exclude_dirs.split(',') if d.strip()}
    allowed_exts_set = {e.strip().lower() for e in args.allowed_exts.split(',') if e.strip() and e.startswith('.')}
    indent_unit = " " * args.indent

    log.info(f"Starting directory: {start_path.resolve()}")
    log.info(f"Output file: {output_file_path}")
    log.debug(f"Excluded directories: {exclude_dirs_set}")
    log.debug(f"Allowed extensions: {allowed_exts_set}")
    log.debug(f"Indentation: {args.indent} spaces")

    # --- Validate Start Directory ---
    if not start_path.is_dir():
        log.error(f"Starting directory not found or is not a directory: '{start_path}'")
        sys.exit(1)

    # --- Execute ---
    try:
        # Ensure the output directory exists
        output_file_path.parent.mkdir(parents=True, exist_ok=True)
        log.debug(f"Ensured output directory exists: {output_file_path.parent}")

        # Open the output file for writing
        with open(output_file_path, 'w', encoding='utf-8') as output_fh:
            # Write the header
            output_fh.write("# Project Structure\n\n")

            # Start processing from the specified directory
            log.info("Processing directory structure...")
            process_directory(start_path, 0, output_fh,
                              exclude_dirs_set, allowed_exts_set, indent_unit)

        log.info(f"Project structure saved successfully to '{output_file_path}'")

    except OSError as e:
        log.error(f"Could not create/write output file '{output_file_path}': {e}")
        sys.exit(1)
    except Exception as e:
        log.exception("An unexpected error occurred during processing.") # Log traceback
        sys.exit(1)

if __name__ == "__main__":
    main()
