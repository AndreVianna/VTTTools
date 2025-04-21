#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Refactored Python script to clean build artifacts, test results, and
temporary files recursively based on configurable directory names and
file patterns. Includes logging and a dry-run mode.
"""

import os
import shutil
import sys
import argparse
import logging
from pathlib import Path

# --- Constants ---
# ANSI escape codes for colors (optional)
COLOR_YELLOW = "\033[93m"
COLOR_RED = "\033[91m"
COLOR_RESET = "\033[0m"

# Default lists (can be overridden by command line args)
DEFAULT_DIRS_TO_CLEAN = ['obj', 'bin', 'pkg', 'testresults', 'coveragereports', '__pycache__']
DEFAULT_FILES_TO_CLEAN = ['*.orig']

# --- Logging Setup ---
log = logging.getLogger(__name__)

# --- Helper Functions ---

def should_use_color(no_color_flag: bool) -> bool:
    """Determines if colored output should be used."""
    return not no_color_flag and sys.stdout.isatty() and \
           (os.name != 'nt' or 'WT_SESSION' in os.environ or 'TERMINAL_EMULATOR' in os.environ)

def colorize(text: str, color_code: str, use_color: bool) -> str:
    """Applies ANSI color codes to text if use_color is True."""
    return f"{color_code}{text}{COLOR_RESET}" if use_color else text

def remove_directory(dir_path: Path, logger: logging.Logger, dry_run: bool, use_color: bool):
    """Removes a directory and its contents, handling errors and dry-run."""
    if not dir_path.is_dir():
        if dir_path.exists():
            logger.warning(f"Skipping '{dir_path}' as it is not a directory.")
        else:
            logger.debug(f"Skipping '{dir_path}' as it does not exist.")
        return

    action = "Would remove" if dry_run else "Removing"
    logger.info(f"{action} directory: \"{dir_path}\"")

    if not dry_run:
        try:
            # ignore_errors=True mimics the /q flag in rmdir /s /q
            shutil.rmtree(dir_path, ignore_errors=True)
        except Exception as e:
            # Log unexpected errors even with ignore_errors=True (though rare)
            error_msg = f"Error removing directory {dir_path}: {e}"
            logger.error(colorize(error_msg, COLOR_RED, use_color))

def remove_file(file_path: Path, logger: logging.Logger, dry_run: bool, use_color: bool):
    """Removes a single file, handling errors and dry-run."""
    if not file_path.is_file():
        if file_path.exists():
             logger.warning(f"Skipping '{file_path}' as it is not a file.")
        else:
             logger.debug(f"Skipping '{file_path}' as it does not exist.")
        return

    action = "Would remove" if dry_run else "Removing"
    logger.info(f"{action} file: \"{file_path}\"") # Log file removal attempts

    if not dry_run:
        try:
            # missing_ok=True mimics the /q flag in del /s /q
            file_path.unlink(missing_ok=True)
        except Exception as e:
            error_msg = f"Error removing file {file_path}: {e}"
            logger.error(colorize(error_msg, COLOR_RED, use_color))


def clean_directories(base_path: Path, dir_names: list[str], logger: logging.Logger, dry_run: bool, use_color: bool):
    """Finds and removes all directories with specific names recursively."""
    logger.info(colorize(f"--- Cleaning Directories ---", COLOR_YELLOW, use_color))
    found_any = False
    for dir_name in dir_names:
        logger.info(f"Searching for '{dir_name}' directories under '{base_path}'...")
        try:
            # Use rglob for recursive search from the base path
            # Using Path.glob('**/dir_name') can be more efficient than iterating all files/dirs
            found_paths = list(base_path.glob(f"**/{dir_name}"))
        except Exception as e:
            logger.error(f"Error searching for '{dir_name}' directories: {e}")
            continue

        actual_dirs = [p for p in found_paths if p.is_dir()]

        if not actual_dirs:
            logger.info(f"No '{dir_name}' directories found.")
            continue

        found_any = True
        # Sort paths by length descending to remove nested directories first
        actual_dirs.sort(key=lambda p: len(p.parts), reverse=True)

        for dir_path in actual_dirs:
            # Pass logger, dry_run, use_color down
            remove_directory(dir_path, logger, dry_run, use_color)

    if not found_any:
         logger.info(colorize(f"--- No specified directories found to clean ---", COLOR_YELLOW, use_color))


def clean_files(base_path: Path, file_patterns: list[str], logger: logging.Logger, dry_run: bool, use_color: bool):
    """Finds and removes all files matching specific patterns recursively."""
    logger.info(colorize(f"--- Cleaning Files ---", COLOR_YELLOW, use_color))
    found_any = False
    for pattern in file_patterns:
        logger.info(f"Searching for files matching '{pattern}' under '{base_path}'...")
        try:
            # Use rglob for recursive search from the base path
            found_paths = list(base_path.rglob(pattern))
        except Exception as e:
            logger.error(f"Error searching for files matching '{pattern}': {e}")
            continue

        actual_files = [p for p in found_paths if p.is_file()]

        if not actual_files:
            logger.info(f"No files matching '{pattern}' found.")
            continue

        found_any = True
        for file_path in actual_files:
            # Pass logger, dry_run, use_color down
            remove_file(file_path, logger, dry_run, use_color)

    if not found_any:
         logger.info(colorize(f"--- No specified files found to clean ---", COLOR_YELLOW, use_color))


# --- Main Execution ---

def main():
    """Parses arguments, sets up logging, and runs the cleaning process."""
    parser = argparse.ArgumentParser(
        description="Clean build artifacts, temporary files, etc., recursively.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "-p", "--path",
        default='.',
        help="Starting path for cleaning (default: current directory)."
    )
    parser.add_argument(
        "-d", "--dirs",
        default=",".join(DEFAULT_DIRS_TO_CLEAN),
        help="Comma-separated list of directory names to remove recursively."
    )
    parser.add_argument(
        "-f", "--files",
        default=",".join(DEFAULT_FILES_TO_CLEAN),
        help="Comma-separated list of file patterns (glob syntax) to remove recursively."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be deleted without actually deleting anything."
    )
    parser.add_argument(
        "--no-color",
        action="store_true",
        help="Disable colored output."
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose (DEBUG level) logging."
    )

    args = parser.parse_args()

    # --- Setup Logging ---
    log_level = logging.DEBUG if args.verbose else logging.INFO
    # Log to stderr for status messages/errors
    logging.basicConfig(level=log_level, format='%(levelname)s: %(message)s', stream=sys.stderr)

    # Determine if color should be used
    use_color = should_use_color(args.no_color)

    # --- Process Arguments ---
    base_path = Path(args.path).resolve() # Resolve to absolute path
    dirs_to_clean = [d.strip() for d in args.dirs.split(',') if d.strip()]
    files_to_clean = [f.strip() for f in args.files.split(',') if f.strip()]

    log.info(f"Starting cleanup process from: {base_path}")
    if args.dry_run:
        log.warning(colorize("*** DRY RUN MODE ENABLED - NO FILES/DIRS WILL BE DELETED ***", COLOR_YELLOW, use_color))
    log.debug(f"Directories to clean: {dirs_to_clean}")
    log.debug(f"File patterns to clean: {files_to_clean}")

    # --- Validate Start Path ---
    if not base_path.is_dir():
        log.error(f"Starting path not found or is not a directory: '{base_path}'")
        sys.exit(1)

    # --- Execute Cleaning ---
    try:
        if dirs_to_clean:
            clean_directories(base_path, dirs_to_clean, log, args.dry_run, use_color)
        else:
            log.info("No directory cleaning targets specified.")

        if files_to_clean:
            clean_files(base_path, files_to_clean, log, args.dry_run, use_color)
        else:
             log.info("No file cleaning targets specified.")

        log.info(colorize("--- Cleaning complete. ---", COLOR_YELLOW, use_color))
        if args.dry_run:
            log.warning(colorize("*** DRY RUN MODE - NO CHANGES WERE MADE ***", COLOR_YELLOW, use_color))

    except Exception as e:
        log.exception("An unexpected error occurred during cleanup.") # Log traceback
        sys.exit(1)

if __name__ == "__main__":
    main()
