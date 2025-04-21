#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Utility functions for JSON processing, specifically compaction.
Uses the built-in 'json' library.
"""

import json
import logging
from pathlib import Path

def process_json_content(json_string: str, logger: logging.Logger, file_path_for_log: Path) -> str | None:
    """
    Tries to parse and compact a JSON string by removing insignificant whitespace.

    Args:
        json_string: The JSON content as a string.
        logger: Logger instance for logging warnings/errors.
        file_path_for_log: Original file path for logging context.

    Returns:
        Compacted JSON string, or None if parsing/compaction fails.
    """
    try:
        # Load the JSON string into a Python object
        obj = json.loads(json_string)

        # Dump the object back to a string with compact separators
        # separators=(',', ':') removes whitespace after commas and colons
        # ensure_ascii=False preserves non-ASCII characters directly
        compacted_json = json.dumps(obj, separators=(',', ':'), ensure_ascii=False)

        logger.debug(f"Successfully compacted JSON content from {file_path_for_log.name}")
        return compacted_json
    except json.JSONDecodeError as e:
        # Log a warning if the JSON is invalid
        logger.warning(f"File '{file_path_for_log}' has JSON extension but failed to parse/compact. Error: {e}")
        return json_string
    except Exception as e:
        # Log other unexpected errors during compaction
        logger.error(f"Unexpected error during JSON compaction for '{file_path_for_log}': {e}")
        return json_string

# You could add other JSON utility functions here in the future.

