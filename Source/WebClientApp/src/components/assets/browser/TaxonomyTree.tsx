import React, { useMemo, useCallback } from 'react';
import { Box, Collapse, Typography, useTheme } from '@mui/material';
import {
  Category as CategoryIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import type { Asset, AssetKind } from '@/types/domain';

interface TaxonomyNode {
  id: string;
  label: string;
  count: number;
  path: string[];
  children: TaxonomyNode[];
}

export interface TaxonomyTreeProps {
  assets: Asset[];
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  expandedNodes: string[];
  onExpandedChange: (nodes: string[]) => void;
}

function buildTaxonomyTree(assets: Asset[]): TaxonomyNode[] {
  const kindMap = new Map<AssetKind, Map<string, Map<string, Map<string, number>>>>();

  for (const asset of assets) {
    const { kind, category, type, subtype } = asset.classification;

    if (!kindMap.has(kind)) {
      kindMap.set(kind, new Map());
    }
    const categoryMap = kindMap.get(kind)!;

    if (category) {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Map());
      }
      const typeMap = categoryMap.get(category)!;

      if (type) {
        if (!typeMap.has(type)) {
          typeMap.set(type, new Map());
        }
        const subtypeMap = typeMap.get(type)!;

        const subtypeKey = subtype || '';
        subtypeMap.set(subtypeKey, (subtypeMap.get(subtypeKey) || 0) + 1);
      }
    }
  }

  const tree: TaxonomyNode[] = [];

  for (const [kind, categoryMap] of kindMap) {
    const kindNode: TaxonomyNode = {
      id: kind,
      label: kind,
      count: 0,
      path: [kind],
      children: [],
    };

    for (const [category, typeMap] of categoryMap) {
      const categoryNode: TaxonomyNode = {
        id: `${kind}/${category}`,
        label: category,
        count: 0,
        path: [kind, category],
        children: [],
      };

      for (const [type, subtypeMap] of typeMap) {
        const typeCount = Array.from(subtypeMap.values()).reduce((a, b) => a + b, 0);
        const typeNode: TaxonomyNode = {
          id: `${kind}/${category}/${type}`,
          label: type,
          count: typeCount,
          path: [kind, category, type],
          children: [],
        };

        for (const [subtype, count] of subtypeMap) {
          if (subtype) {
            typeNode.children.push({
              id: `${kind}/${category}/${type}/${subtype}`,
              label: subtype,
              count,
              path: [kind, category, type, subtype],
              children: [],
            });
          }
        }

        categoryNode.children.push(typeNode);
        categoryNode.count += typeCount;
      }

      kindNode.children.push(categoryNode);
      kindNode.count += categoryNode.count;
    }

    tree.push(kindNode);
  }

  return tree;
}

interface TreeNodeRowProps {
  node: TaxonomyNode;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

const TreeNodeRow: React.FC<TreeNodeRowProps> = ({
  node,
  depth,
  isSelected,
  isExpanded,
  hasChildren,
  onSelect,
  onToggleExpand,
}) => {
  const theme = useTheme();
  const indentPx = depth * 12;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    if (hasChildren && !isExpanded) {
      onToggleExpand();
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };

  const Icon = depth === 0 ? CategoryIcon : hasChildren ? (isExpanded ? FolderOpenIcon : FolderIcon) : FolderIcon;

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        py: 0.5,
        px: 1,
        pl: `${8 + indentPx}px`,
        cursor: 'pointer',
        borderRadius: 1,
        backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
        '&:hover': {
          backgroundColor: isSelected ? theme.palette.action.selected : theme.palette.action.hover,
        },
      }}
    >
      {hasChildren ? (
        <Box
          onClick={handleExpandClick}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          {isExpanded ? (
            <ExpandMoreIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
          ) : (
            <ChevronRightIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
          )}
        </Box>
      ) : (
        <Box sx={{ width: 20 }} />
      )}
      <Icon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {node.label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.action.hover,
          borderRadius: 1,
          px: 0.75,
          minWidth: 24,
          textAlign: 'center',
        }}
      >
        {node.count}
      </Typography>
    </Box>
  );
};

export const TaxonomyTree: React.FC<TaxonomyTreeProps> = ({
  assets,
  selectedPath,
  onPathChange,
  expandedNodes,
  onExpandedChange,
}) => {
  const tree = useMemo(() => buildTaxonomyTree(assets), [assets]);

  const isNodeExpanded = useCallback(
    (nodeId: string) => expandedNodes.includes(nodeId),
    [expandedNodes]
  );

  const toggleNodeExpansion = useCallback(
    (nodeId: string, depth: number) => {
      if (expandedNodes.includes(nodeId)) {
        onExpandedChange(expandedNodes.filter((id) => id !== nodeId && !id.startsWith(nodeId + '/')));
      } else {
        if (depth === 0) {
          const otherRootNodes = tree.map((n) => n.id).filter((id) => id !== nodeId);
          const newExpanded = expandedNodes.filter(
            (id) => !otherRootNodes.some((rootId) => id === rootId || id.startsWith(rootId + '/'))
          );
          onExpandedChange([...newExpanded, nodeId]);
        } else {
          onExpandedChange([...expandedNodes, nodeId]);
        }
      }
    },
    [expandedNodes, onExpandedChange, tree]
  );

  const handleSelect = useCallback(
    (node: TaxonomyNode) => {
      const currentPath = selectedPath.join('/');
      const nodePath = node.path.join('/');
      if (currentPath === nodePath) {
        onPathChange([]);
      } else {
        onPathChange(node.path);
      }
    },
    [selectedPath, onPathChange]
  );

  const renderNode = (node: TaxonomyNode, depth: number): React.ReactNode => {
    const nodeId = node.id;
    const isExpanded = isNodeExpanded(nodeId);
    const isSelected = selectedPath.join('/') === node.path.join('/');
    const hasChildren = node.children.length > 0;

    return (
      <Box key={nodeId}>
        <TreeNodeRow
          node={node}
          depth={depth}
          isSelected={isSelected}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onSelect={() => handleSelect(node)}
          onToggleExpand={() => toggleNodeExpansion(nodeId, depth)}
        />
        {hasChildren && (
          <Collapse in={isExpanded}>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </Collapse>
        )}
      </Box>
    );
  };

  return <Box>{tree.map((node) => renderNode(node, 0))}</Box>;
};

export default TaxonomyTree;
