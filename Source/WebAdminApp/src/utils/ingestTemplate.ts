/**
 * Downloads a sample JSON template for asset ingest.
 * The template shows the expected format with placeholder values.
 */
export const downloadIngestTemplate = (): void => {
    const jsonContent = `[
  {
    "name": "<name (required)>",
    "kind": "<kind (required)>",
    "category": "<category (required)>",
    "type": "<type (required)>",
    "subtype": "<subtype (optional)>",
    "size": "<size (optional)>",
    "environment": "<environment (optional)>",
    "description": "<description (required)>",
    "tags": ["<tag1 (optional)>", "<tag2 (optional)>"]
  }
]`;
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'asset_ingest_template.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
