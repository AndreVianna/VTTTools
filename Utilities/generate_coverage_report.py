#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Automates .NET code coverage report generation using dotnet-coverage
and reportgenerator global tools. Displays command output directly.

Assumes it's run from the solution root directory.
Requires dotnet-coverage and reportgenerator to be installed as global tools.
"""

import argparse
import logging
import shutil
import subprocess
import sys
from pathlib import Path

# --- Logging Setup ---
log = logging.getLogger(__name__)

# --- Helper Functions ---

def setup_logging(verbose: bool):
    """Configures logging based on verbosity."""
    log_level = logging.DEBUG if verbose else logging.INFO
    # Log to stderr for status messages/errors
    logging.basicConfig(level=log_level,
                        format='%(asctime)s - %(levelname)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S',
                        stream=sys.stderr) # Explicitly log to stderr
    log.info(f"Logging level set to {logging.getLevelName(log_level)}")

def run_command(command_args: list[str], logger: logging.Logger, dry_run: bool, cwd: Path | None = None):
    """
    Runs an external command using subprocess, displaying its output directly.

    Args:
        command_args: A list containing the command and its arguments.
        logger: Logger instance.
        dry_run: If True, only log the command without running it.
        cwd: The working directory to run the command in (defaults to None).

    Returns:
        True if the command succeeded (or in dry run), False otherwise.
    """
    cmd_string = ' '.join(command_args) # For logging purposes
    logger.info(f"Running command: {cmd_string}" + (" (DRY RUN)" if dry_run else ""))
    logger.info("Command output will be displayed below:")

    if dry_run:
        return True # Simulate success in dry run

    try:
        # Run the command.
        # By default (without capture_output=True), stdout and stderr
        # are inherited from the parent process (this script), so the
        # command's output will print directly to the console.
        # check=True raises CalledProcessError on non-zero exit code.
        # text=True ensures streams are handled as text (requires encoding).
        process = subprocess.run(
            command_args,
            check=True,
            text=True,            # Handle streams as text
            encoding='utf-8',     # Specify encoding for text mode
            cwd=cwd
            # No capture_output=True
            # stdout=None, stderr=None are defaults, meaning inherit
        )
        # No need to log process.stdout/stderr as it went directly to console
        logger.info(f"Command '{command_args[0]}' executed successfully.")
        return True
    except FileNotFoundError:
        logger.error(f"Error: Command not found: '{command_args[0]}'. Is the tool installed and in PATH?")
        return False
    except subprocess.CalledProcessError as e:
        # Error details are usually printed directly by the failed process to stderr.
        logger.error(f"Command '{cmd_string}' failed with exit code {e.returncode}.")
        # Log the command again for context, as the actual error output might be scrolled away.
        logger.error(f"Failed command: {cmd_string}")
        return False
    except Exception as e:
        logger.exception(f"An unexpected error occurred while running command: {cmd_string}")
        return False

def delete_path(path_to_delete: Path, is_dir: bool, logger: logging.Logger, dry_run: bool):
    """Deletes a file or directory if it exists."""
    action = "Would delete" if dry_run else "Deleting"
    path_type = "directory" if is_dir else "file"

    if path_to_delete.exists():
        logger.info(f"{action} existing {path_type}: {path_to_delete}")
        if not dry_run:
            try:
                if is_dir:
                    if path_to_delete.is_dir(): # Double check it's a dir
                         shutil.rmtree(path_to_delete)
                    else:
                         logger.warning(f"Path '{path_to_delete}' exists but is not a directory. Skipping delete.")
                else:
                     if path_to_delete.is_file(): # Double check it's a file
                         path_to_delete.unlink()
                     else:
                         logger.warning(f"Path '{path_to_delete}' exists but is not a file. Skipping delete.")
            except OSError as e:
                logger.error(f"Error deleting {path_type} {path_to_delete}: {e}")
            except Exception as e:
                 logger.exception(f"Unexpected error deleting {path_type} {path_to_delete}")
    else:
        logger.debug(f"{path_type.capitalize()} '{path_to_delete}' does not exist. No action needed.")


# --- Main Execution ---

def main():
    """Parses arguments and runs the coverage generation steps."""
    parser = argparse.ArgumentParser(
        description="Generate .NET code coverage reports using dotnet-coverage and reportgenerator.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    # Configuration Arguments
    parser.add_argument(
        "--coverage-file",
        default="TestResults/coverage.xml",
        help="Path relative to CWD for the raw Cobertura coverage file."
    )
    parser.add_argument(
        "--report-dir",
        default="CoverageReport/Full",
        help="Target directory relative to CWD for the final report generator output."
    )
    parser.add_argument(
        "--assembly-filters",
        default="+VttTools.*;-VttTools.*.UnitTests",
        help="Assembly filters for reportgenerator (e.g., +Include.*;-Exclude.*)."
    )
    parser.add_argument(
        "--class-filters",
        default="-*.Migrations.*;-System.Text.RegularExpressions.*",
        help="Class filters for reportgenerator (e.g., +Include.*;-Exclude.*)."
    )
    parser.add_argument(
        "--report-types",
        default="Html;JsonSummary",
        help="Report types for reportgenerator (semicolon-separated)."
    )
    parser.add_argument(
        "--dotnet-test-args",
        default="",
        help="Additional arguments to pass to the 'dotnet test' command (e.g., '--no-build'). Quote if contains spaces."
    )
    # Control Arguments
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show commands and actions without executing them."
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose (DEBUG level) logging."
    )

    args = parser.parse_args()

    # --- Setup ---
    setup_logging(args.verbose)
    current_working_dir = Path.cwd()
    log.info(f"Running in directory: {current_working_dir}")
    if args.dry_run:
        log.warning("*** DRY RUN MODE ENABLED - NO FILES/DIRS WILL BE MODIFIED/DELETED, NO COMMANDS WILL BE RUN ***")

    coverage_file_path = current_working_dir / args.coverage_file
    report_dir_path = current_working_dir / args.report_dir

    # --- Step 1: Delete old coverage file ---
    log.info("--- Step 1: Cleaning old coverage file ---")
    delete_path(coverage_file_path, is_dir=False, logger=log, dry_run=args.dry_run)

    # --- Step 2: Generate raw coverage data ---
    log.info("--- Step 2: Generating raw coverage data (dotnet-coverage) ---")
    # Ensure parent directory for coverage file exists
    if not args.dry_run:
        try:
            coverage_file_path.parent.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            log.error(f"Could not create directory '{coverage_file_path.parent}': {e}")
            sys.exit(1)

    # Construct the inner 'dotnet test' command string, including additional args
    dotnet_test_command = f"dotnet test {args.dotnet_test_args}".strip()

    coverage_command = [
        "dotnet-coverage", "collect",
        "-f", "cobertura",
        "-o", str(coverage_file_path),
        dotnet_test_command # Pass the inner command as a single argument
    ]
    if not run_command(coverage_command, log, args.dry_run, cwd=current_working_dir):
        log.error("Failed to generate raw coverage data. Aborting.")
        sys.exit(1)

    # --- Step 3: Delete old report directory ---
    log.info("--- Step 3: Cleaning old report directory ---")
    delete_path(report_dir_path, is_dir=True, logger=log, dry_run=args.dry_run)

    # --- Step 4: Generate final report ---
    log.info("--- Step 4: Generating final report (reportgenerator) ---")
    # Ensure target directory exists before running reportgenerator
    if not args.dry_run:
        try:
            report_dir_path.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            log.error(f"Could not create directory '{report_dir_path}': {e}")
            sys.exit(1)

    # Check if the coverage file was actually created before proceeding
    if not coverage_file_path.exists() and not args.dry_run:
         log.error(f"Coverage file '{coverage_file_path}' not found after running dotnet-coverage. Cannot generate report. Aborting.")
         sys.exit(1)

    report_command = [
        "reportgenerator",
        f"-reports:{coverage_file_path}",
        f"-targetdir:{report_dir_path}",
        f"-assemblyfilters:{args.assembly_filters}",
        f"-classfilters:{args.class_filters}",
        f"-reporttypes:{args.report_types}"
    ]
    if not run_command(report_command, log, args.dry_run, cwd=current_working_dir):
        log.error("Failed to generate final report. Aborting.")
        sys.exit(1)

    log.info("--- Coverage generation process completed successfully. ---")
    if args.dry_run:
        log.warning("*** DRY RUN MODE - NO CHANGES WERE MADE ***")

if __name__ == "__main__":
    main()
