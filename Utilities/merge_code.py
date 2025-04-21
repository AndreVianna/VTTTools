#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Refactored Python script based on user-provided version.
Recursively scans a directory (relative to CWD), filters files/folders,
optionally processes/compacts specific types (XML, JSON, C#),
and merges content into a single JSON file in the CWD.
Uses argparse for configuration and logging for output.
Imports utilities from an 'imports' subfolder.
"""

import os
import sys
import argparse
import logging
import json
from pathlib import Path

# Assuming 'imports' is a folder in the same directory as this script
# or accessible via Python path. No sys.path modification needed if
# the script is run correctly relative to the 'imports' folder.
try:
    from imports.json_utils import process_json_content
    from imports.xml_utils import process_xml_content
    from imports.csharp_utils import process_csharp_content
except ImportError as e:
    print(f"FATAL: Could not import utility functions from 'imports' folder. {e}", file=sys.stderr)
    print(f"Ensure 'xml_utils.py', 'json_utils.py', 'csharp_utils.py' exist in an 'imports' subfolder.", file=sys.stderr)
    sys.exit(1)

# --- Logging Setup ---
# Logger instance configured in main()
log = logging.getLogger(__name__)

# --- Helper Functions ---

def setup_logging(verbose_mode: bool, log_file_path: Path):
    """Configures logging based on debug mode."""
    log_level = logging.DEBUG if verbose_mode else logging.INFO
    # Configure root logger
    logging.basicConfig(level=log_level,
                        format='%(asctime)s - %(levelname)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S',
                        handlers=[logging.StreamHandler(sys.stderr)]) # Log basic info/errors to stderr

    log.info(f"Logging level set to {logging.getLevelName(log_level)}")

    if verbose_mode:
        log.info(f"Debug mode enabled.")
        try:
             # Ensure parent directory exists for the log file
             log_file_path.parent.mkdir(parents=True, exist_ok=True)
             # Add file handler for debug mode for more detailed logs
             file_handler = logging.FileHandler(log_file_path, mode='w', encoding='utf-8')
             file_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
             file_handler.setFormatter(file_formatter)
             # Add handler ONLY to our specific logger, not root, to avoid duplicate console logs
             log.addHandler(file_handler)
             # Set propagate to False if using basicConfig AND adding handler to specific logger
             # log.propagate = False # Avoid double logging to console if basicConfig used stream handler
             log.info(f"Logging detailed debug output to: {log_file_path}")
        except OSError as e:
             log.warning(f"Could not create or write to log file '{log_file_path}': {e}")

def read_file_content(file_path: Path, logger: logging.Logger,
                      xml_exts: set, json_exts: set, csharp_exts: set,
                      compact_xml_flag: bool, compact_json_flag: bool) -> str | None:
    """
    Reads file content, handles BOM, applies type-specific processing conditionally.

    Args:
        file_path: Path to the file.
        logger: Logger instance.
        xml_exts: Set of lowercase XML extensions.
        json_exts: Set of lowercase JSON extensions.
        csharp_exts: Set of lowercase C# extensions.
        compact_xml_flag: Boolean indicating if XML should be compacted.
        compact_json_flag: Boolean indicating if JSON should be compacted.

    Returns:
        Processed content string, empty string on read error, or None if excluded.
    """
    logger.debug(f"Reading content of: {file_path}")
    raw_content = None
    try:
        raw_content = file_path.read_text(encoding='utf-8', errors='strict')
        logger.debug(f"Successfully read {file_path} as UTF-8.")
    except UnicodeDecodeError as e_utf8:
        logger.warning(f"Encoding error reading {file_path} as UTF-8: {e_utf8}. Trying default encoding.")
        try:
            raw_content = file_path.read_text(encoding=None, errors='replace')
            logger.debug(f"Successfully read {file_path} with default encoding.")
        except Exception as e_fallback:
            logger.error(f"Error reading {file_path} with default encoding: {e_fallback}")
            return "" # Return empty string on error as per user's version
    except OSError as e:
        logger.error(f"OS error reading {file_path}: {e}")
        return "" # Return empty string on error
    except Exception as e:
        logger.error(f"Unexpected error reading {file_path}: {e}")
        return "" # Return empty string on error

    if raw_content is None:
         return ""

    if raw_content.startswith('\ufeff'):
        logger.debug(f"Removing leading ZWNBSP/BOM from {file_path.name}")
        raw_content = raw_content[1:]

    file_ext_lower = file_path.suffix.lower()

    # --- Apply processing based on extension and flags ---
    if file_ext_lower in xml_exts:
        if compact_xml_flag:
            logger.debug(f"Attempting XML compaction for {file_path.name}...")
            return process_xml_content(raw_content, logger, file_path)
        else:
            logger.debug(f"XML compaction disabled for {file_path.name}, using raw content.")
            return raw_content # Compaction disabled

    elif file_ext_lower in json_exts:
        if compact_json_flag:
            logger.debug(f"Attempting JSON compaction for {file_path.name}...")
            return process_json_content(raw_content, logger, file_path)
        else:
            logger.debug(f"JSON compaction disabled for {file_path.name}, using raw content.")
            return raw_content # Compaction disabled

    elif file_ext_lower in csharp_exts:
        logger.debug(f"Attempting C# processing for {file_path.name}...")
        return process_csharp_content(raw_content, logger, file_path)

    else:
        # File type not designated for special processing
        return raw_content


def process_folder(folder_path: Path, base_processing_dir: Path, logger: logging.Logger,
                   exclude_dirs: set, allowed_exts: set,
                   xml_exts: set, json_exts: set, csharp_exts: set,
                   compact_xml_flag: bool, compact_json_flag: bool) -> dict | None:
    """
    Recursively processes a folder, building a dictionary representation.

    Args:
        folder_path: Path object for the folder currently being processed.
        base_processing_dir: Top-level directory processing started from.
        logger: Logger instance.
        exclude_dirs: Set of lowercase directory names to exclude.
        allowed_exts: Set of lowercase extensions for files to include.
        xml_exts: Set of lowercase XML extensions for compaction.
        json_exts: Set of lowercase JSON extensions for compaction.
        csharp_exts: Set of lowercase C# extensions for processing.
        compact_xml_flag: Boolean indicating if XML should be compacted.
        compact_json_flag: Boolean indicating if JSON should be compacted.

    Returns:
        A dictionary representing the folder structure, or None if empty/excluded.
    """
    folder_name = folder_path.name
    try:
        log_rel_path = folder_path.relative_to(base_processing_dir)
    except ValueError:
        log_rel_path = folder_path

    logger.debug(f"Processing folder: {log_rel_path}")
    children = []

    try:
        items = sorted(folder_path.iterdir())
    except PermissionError:
        logger.warning(f"Permission denied reading directory: {folder_path}. Skipping.")
        return None
    except OSError as e:
        logger.error(f"Error reading directory {folder_path}: {e}")
        return None

    for item in items:
        if item.is_dir():
            if item.name.lower() not in exclude_dirs:
                logger.debug(f"  Found allowed subdir: {item.name}, processing recursively...")
                subfolder_data = process_folder(
                    item, base_processing_dir, logger,
                    exclude_dirs, allowed_exts,
                    xml_exts, json_exts, csharp_exts, # Pass sets
                    compact_xml_flag, compact_json_flag # Pass flags
                )
                if subfolder_data:
                    children.append(subfolder_data)
            else:
                logger.debug(f"  Excluding subdir: {item.name}")
        elif item.is_file():
            if item.suffix.lower() in allowed_exts:
                logger.debug(f"  Found allowed file: {item.name}")
                # Pass extension sets and compaction flags to read_file_content
                file_content = read_file_content(
                    item, logger, xml_exts, json_exts, csharp_exts,
                    compact_xml_flag, compact_json_flag
                )

                if file_content is not None: # Check for exclusion signal
                    children.append({
                        "type": "file",
                        "name": item.name,
                        "content": file_content
                    })
                else:
                    logger.debug(f"  Skipping file {item.name} due to exclusion signal.")
            else:
                logger.debug(f"  Excluding file: {item.name} (extension {item.suffix})")

    if not children:
        logger.debug(f"Skipping empty or fully excluded folder: {log_rel_path}")
        return None

    logger.info(f"Finished processing folder '{log_rel_path}'. Found {len(children)} included items.")
    return {
        "type": "folder",
        "name": folder_name,
        "children": children
    }


# --- Main Execution ---

def main():
    """Parses arguments, sets up logging, and starts the merge process."""

    # --- Default Configurations ---
    DEFAULT_EXCLUDE_DIRS = ".git,.vs,.cursor,.github,.vscode,migrations,obj,bin,pkg,lib,node_modules,properties,testresults,coveragereports,uploads"
    DEFAULT_ALLOWED_EXTS = ".md,.slnx,.sln,.csproj,.cs,.razor,.json,.xml,.vbproj,.fsproj,.shproj,.proj,.props,.targets,.nuspec,.config,.settings,.resx,.runsettings,.ruleset,.pubxml,.xdt,.vcxproj.filter,.py,.cmd,.sh"
    DEFAULT_XML_EXTS = ".xml,.slnx,.csproj,.vbproj,.fsproj,.shproj,.proj,.props,.targets,.nuspec,.config,.settings,.resx,.runsettings,.ruleset,.pubxml,.xdt,.vcxproj.filter"
    DEFAULT_JSON_EXTS = ".json"
    DEFAULT_CSHARP_EXTS = ".cs"

    # --- Argument Parsing ---
    parser = argparse.ArgumentParser(
        description="Merge source files from CWD into a single JSON file. Optionally compacts XML/JSON, processes C#.",
        # Corrected epilog to be a static example
        epilog="Example: python path/to/script/merge_script.py Source -d --compact-xml --compact-json",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "relative_path",
        nargs='?',
        default="Source",
        help="Path relative to the current working directory to process."
    )
    parser.add_argument(
        "-o", "--output",
        default=None, # Default calculated later
        help="Path to the output JSON file (default: <CWD_Name>.<Input_Rel_Path>.<Output_Extension> in CWD)."
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
        "--xml-exts",
        default=DEFAULT_XML_EXTS,
        help="Comma-separated list of extensions to identify as XML."
    )
    parser.add_argument(
        "--json-exts",
        default=DEFAULT_JSON_EXTS,
        help="Comma-separated list of extensions to identify as JSON."
    )
    parser.add_argument(
        "--csharp-exts",
        default=DEFAULT_CSHARP_EXTS,
        help="Comma-separated list of extensions to process as C#."
    )
    parser.add_argument(
        "--compact-xml",
        action="store_true",
        help="Enable compaction for XML files identified by --xml-exts."
    )
    parser.add_argument(
        "--compact-json",
        action="store_true",
        help="Enable compaction for JSON files identified by --json-exts."
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose (DEBUG level) logging."
    )
    parser.add_argument(
        "--output-ext",
        default=".src",
        help="Extension for the output file (e.g., .json, .src)."
    )
    parser.add_argument(
        "--pretty-json",
        action="store_true",
        help="Indent the output JSON file for readability (default: compact)."
    )


    args = parser.parse_args()

    # --- Setup Logging ---
    log_file_path = Path.cwd() / "MergeCode.log"
    setup_logging(args.verbose, log_file_path)

    # --- Process Arguments ---
    current_working_dir = Path.cwd()
    log.info(f"Current Working Directory (base for operations): {current_working_dir}")

    relative_path_input = args.relative_path
    if relative_path_input in ('\\', '/'):
        relative_path_input = '.'

    # Convert comma-separated args to sets of lowercase strings
    exclude_dirs_set = {d.strip().lower() for d in args.exclude_dirs.split(',') if d.strip()}
    allowed_exts_set = {e.strip().lower() for e in args.allowed_exts.split(',') if e.strip() and e.startswith('.')}
    xml_exts_set = {e.strip().lower() for e in args.xml_exts.split(',') if e.strip() and e.startswith('.')}
    json_exts_set = {e.strip().lower() for e in args.json_exts.split(',') if e.strip() and e.startswith('.')}
    csharp_exts_set = {e.strip().lower() for e in args.csharp_exts.split(',') if e.strip() and e.startswith('.')}

    # Compaction flags
    compact_xml_flag = args.compact_xml
    compact_json_flag = args.compact_json

    # --- Path Validation ---
    if ".." in relative_path_input:
        log.error("Parent path references ('..') are not allowed in relative_path.")
        sys.exit(1)

    input_path_obj = Path(relative_path_input)
    absolute_path: Path
    if input_path_obj.is_absolute():
         log.warning(f"Absolute path provided '{input_path_obj}'. Processing this path directly.")
         try:
             absolute_path = input_path_obj.resolve(strict=True)
         except FileNotFoundError:
             log.error(f"Absolute path '{input_path_obj}' does not exist.")
             sys.exit(1)
         except OSError as e:
             log.error(f"Error resolving/accessing path '{input_path_obj}': {e}")
             sys.exit(1)
    else:
        try:
            absolute_path = current_working_dir.joinpath(relative_path_input).resolve(strict=True)
        except FileNotFoundError:
             log.error(f"Relative path '{current_working_dir / relative_path_input}' does not exist.")
             sys.exit(1)
        except OSError as e:
             log.error(f"Error resolving/accessing path '{current_working_dir / relative_path_input}': {e}")
             sys.exit(1)

    if not absolute_path.is_dir():
        log.error(f"Resolved path '{absolute_path}' is not a directory.")
        sys.exit(1)

    # --- Determine Output File Path ---
    if args.output:
        # If output is specified, use it directly but ensure correct extension
        output_file_path = Path(args.output).with_suffix(args.output_ext)
    else:
        # Default output filename calculation
        current_folder_name = current_working_dir.name or "Root"
        relative_path_cleaned = relative_path_input.strip('.\\/')
        if not relative_path_cleaned or relative_path_cleaned == '.':
             relative_path_dots = ""
        else:
            relative_path_dots = relative_path_cleaned.replace('\\', '.').replace('/', '.').strip('.')

        if not relative_path_dots:
            file_name_base = current_folder_name
        else:
            file_name_base = f"{current_folder_name}.{relative_path_dots}"
        # Use specified or default extension
        output_filename = f"{file_name_base.replace(' ', '')}{args.output_ext}"
        output_file_path = current_working_dir / output_filename

    # Ensure output directory exists
    try:
        output_file_path.parent.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        log.error(f"Could not create output directory '{output_file_path.parent}': {e}")
        sys.exit(1)

    # --- Log Final Configuration ---
    log.info(f"Target directory to process: {absolute_path}")
    log.info(f"Output file location: {output_file_path}")
    log.info(f"XML compaction enabled: {compact_xml_flag} (for {xml_exts_set})")
    log.info(f"JSON compaction enabled: {compact_json_flag} (for {json_exts_set})")
    log.info(f"C# processing enabled for extensions: {csharp_exts_set}")
    log.debug(f"Excluded Directories: {exclude_dirs_set}")
    log.debug(f"Allowed Extensions (all included files): {allowed_exts_set}")
    log.info(f"Output JSON indented: {args.pretty_json}")

    # --- Execute Processing ---
    try:
        output_file_path.unlink(missing_ok=True) # Delete existing output file
        root_data = process_folder(
            absolute_path, current_working_dir, log,
            exclude_dirs_set, allowed_exts_set,
            xml_exts_set, json_exts_set, csharp_exts_set, # Pass sets
            compact_xml_flag, compact_json_flag # Pass flags
        )

        if root_data is None:
             log.warning(f"No allowed files or subdirectories found in '{absolute_path}'. Output file will be empty.")
             output_file_path.write_text("{}", encoding='utf-8')
        else:
            log.info(f"Writing JSON data to {output_file_path}...")
            with open(output_file_path, 'w', encoding='utf-8') as output_fh:
                # Control indentation based on flag
                indent_level = 2 if args.pretty_json else None
                # Use separators for compact JSON if not pretty printing
                separators = (',', ':') if not args.pretty_json else (', ', ': ')
                json.dump(root_data, output_fh, indent=indent_level, ensure_ascii=False, separators=separators)
            log.info(f"Successfully completed merging files into '{output_file_path}'")

    except OSError as e:
        log.error(f"Aborted due to OS error during processing/writing: {e}")
        sys.exit(1)
    except Exception as e:
        log.exception("An unexpected error occurred during processing.")
        sys.exit(1)

if __name__ == "__main__":
    main()
