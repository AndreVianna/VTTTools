#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Utility functions for XML processing, specifically compaction.
Requires the 'lxml' library.
"""

import logging
from pathlib import Path
from lxml import etree # type: ignore # Requires: pip install lxml

def process_xml_content(xml_string: str, logger: logging.Logger, file_path_for_log: Path) -> str | None:
    """
    Tries to parse and compact an XML string by removing insignificant whitespace.

    Args:
        xml_string: The XML content as a string.
        logger: Logger instance for logging warnings/errors.
        file_path_for_log: Original file path for logging context.

    Returns:
        Compacted XML string, or None if parsing/compaction fails.
    """
    try:
        # Use a parser that removes blank text for compaction.
        # remove_blank_text ignores whitespace nodes between elements.
        parser = etree.XMLParser(remove_blank_text=True)

        # Parse from string. Need to encode to bytes first for fromstring with parser.
        root = etree.fromstring(xml_string.encode('utf-8'), parser)

        # Serialize back to a string (unicode), without pretty printing.
        # pretty_print=False ensures no extra whitespace is added back.
        compacted_xml = etree.tostring(root, encoding='unicode', pretty_print=False)

        logger.debug(f"Successfully compacted XML content from {file_path_for_log.name}")
        return compacted_xml
    except etree.XMLSyntaxError as e:
        # Log a warning if the XML is invalid
        logger.warning(f"File '{file_path_for_log}' has XML extension but failed to parse/compact. Error: {e}")
        return xml_string
    except Exception as e:
        # Log other unexpected errors during compaction
        logger.error(f"Unexpected error during XML compaction for '{file_path_for_log}': {e}")
        return xml_string

# You could add other XML utility functions here in the future.

