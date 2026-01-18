import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    ExpandMore as ExpandMoreIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import { AttributeRangeSlider, TaxonomyTree } from '@/components/assets/browser';
import type { Asset } from '@/types/domain';

export interface AssetLibrarySidebarProps {
    assets: Asset[];
    selectedPath: string[];
    onPathChange: (path: string[]) => void;
    expandedNodes: string[];
    onExpandedChange: (nodes: string[]) => void;
    attributeFilters: Record<string, [number, number]>;
    onAttributeFilterChange: (attribute: string, value: [number, number]) => void;
    ownershipFilter: 'mine' | 'others' | 'all';
    onOwnershipFilterChange: (filter: 'mine' | 'others' | 'all') => void;
    statusFilter: 'all' | 'published' | 'draft';
    onStatusFilterChange: (filter: 'all' | 'published' | 'draft') => void;
    searchQuery: string;
    letterFilter: string | null;
    onResetFilters: () => void;
    onCreateNew: () => void;
}

export const AssetLibrarySidebar: React.FC<AssetLibrarySidebarProps> = ({
    assets,
    selectedPath,
    onPathChange,
    expandedNodes,
    onExpandedChange,
    attributeFilters,
    onAttributeFilterChange,
    ownershipFilter,
    onOwnershipFilterChange,
    statusFilter,
    onStatusFilterChange,
    searchQuery,
    letterFilter,
    onResetFilters,
    onCreateNew,
}) => {
    const hasActiveFilters =
        selectedPath.length > 0 ||
        searchQuery ||
        letterFilter ||
        Object.keys(attributeFilters).length > 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 1.5 }}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={onCreateNew}
                    sx={{ mb: 2 }}
                >
                    New Asset
                </Button>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
                <Accordion defaultExpanded disableGutters elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Classification
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                        <TaxonomyTree
                            assets={assets}
                            selectedPath={selectedPath}
                            onPathChange={onPathChange}
                            expandedNodes={expandedNodes}
                            onExpandedChange={onExpandedChange}
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion disableGutters elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Attributes
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                        <AttributeRangeSlider
                            label="HP"
                            min={0}
                            max={500}
                            value={attributeFilters['HP'] ?? [0, 500]}
                            onChange={(v) => onAttributeFilterChange('HP', v)}
                        />
                        <AttributeRangeSlider
                            label="AC"
                            min={0}
                            max={30}
                            value={attributeFilters['AC'] ?? [0, 30]}
                            onChange={(v) => onAttributeFilterChange('AC', v)}
                        />
                        <AttributeRangeSlider
                            label="CR"
                            min={0}
                            max={30}
                            value={attributeFilters['CR'] ?? [0, 30]}
                            onChange={(v) => onAttributeFilterChange('CR', v)}
                        />
                    </AccordionDetails>
                </Accordion>

                <OwnershipAccordion
                    ownershipFilter={ownershipFilter}
                    onOwnershipFilterChange={onOwnershipFilterChange}
                />

                <StatusAccordion
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                />

                {hasActiveFilters && (
                    <Box sx={{ p: 1, pt: 2 }}>
                        <Button
                            size="small"
                            startIcon={<FilterListIcon />}
                            onClick={onResetFilters}
                            fullWidth
                            variant="outlined"
                        >
                            Reset Filters
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

interface OwnershipAccordionProps {
    ownershipFilter: 'mine' | 'others' | 'all';
    onOwnershipFilterChange: (filter: 'mine' | 'others' | 'all') => void;
}

const OwnershipAccordion: React.FC<OwnershipAccordionProps> = ({
    ownershipFilter,
    onOwnershipFilterChange,
}) => {
    const handleMineChange = (checked: boolean) => {
        if (checked) {
            onOwnershipFilterChange(ownershipFilter === 'others' ? 'all' : 'mine');
        } else {
            onOwnershipFilterChange('others');
        }
    };

    const handleOthersChange = (checked: boolean) => {
        if (checked) {
            onOwnershipFilterChange(ownershipFilter === 'mine' ? 'all' : 'others');
        } else {
            onOwnershipFilterChange('mine');
        }
    };

    return (
        <Accordion disableGutters elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Ownership
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={ownershipFilter === 'mine' || ownershipFilter === 'all'}
                                onChange={(e) => handleMineChange(e.target.checked)}
                            />
                        }
                        label={<Typography variant="body2">Mine</Typography>}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={ownershipFilter === 'others' || ownershipFilter === 'all'}
                                onChange={(e) => handleOthersChange(e.target.checked)}
                            />
                        }
                        label={<Typography variant="body2">Others</Typography>}
                    />
                </FormGroup>
            </AccordionDetails>
        </Accordion>
    );
};

interface StatusAccordionProps {
    statusFilter: 'all' | 'published' | 'draft';
    onStatusFilterChange: (filter: 'all' | 'published' | 'draft') => void;
}

const StatusAccordion: React.FC<StatusAccordionProps> = ({
    statusFilter,
    onStatusFilterChange,
}) => {
    const handlePublishedChange = (checked: boolean) => {
        if (checked) {
            onStatusFilterChange(statusFilter === 'draft' ? 'all' : 'published');
        } else {
            onStatusFilterChange('draft');
        }
    };

    const handleDraftChange = (checked: boolean) => {
        if (checked) {
            onStatusFilterChange(statusFilter === 'published' ? 'all' : 'draft');
        } else {
            onStatusFilterChange('published');
        }
    };

    return (
        <Accordion disableGutters elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Status
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={statusFilter === 'all' || statusFilter === 'published'}
                                onChange={(e) => handlePublishedChange(e.target.checked)}
                            />
                        }
                        label={<Typography variant="body2">Published</Typography>}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={statusFilter === 'all' || statusFilter === 'draft'}
                                onChange={(e) => handleDraftChange(e.target.checked)}
                            />
                        }
                        label={<Typography variant="body2">Draft</Typography>}
                    />
                </FormGroup>
            </AccordionDetails>
        </Accordion>
    );
};
