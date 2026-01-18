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
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import { ResourceRole } from '@/types/domain';

const CATEGORY_TABS = [
    { value: ResourceRole.Undefined, label: 'All' },
    { value: ResourceRole.Background, label: 'Background' },
    { value: ResourceRole.Token, label: 'Token' },
    { value: ResourceRole.Portrait, label: 'Portrait' },
    { value: ResourceRole.Overlay, label: 'Overlay' },
    { value: ResourceRole.Illustration, label: 'Illustration' },
    { value: ResourceRole.SoundEffect, label: 'Sound Effect' },
    { value: ResourceRole.AmbientSound, label: 'Ambient Sound' },
    { value: ResourceRole.CutScene, label: 'Cut Scene' },
];

export interface MediaLibrarySidebarProps {
    selectedCategory: ResourceRole;
    onCategoryChange: (category: ResourceRole) => void;
    ownershipFilter: 'mine' | 'others' | 'all';
    onOwnershipFilterChange: (filter: 'mine' | 'others' | 'all') => void;
    statusFilter: 'all' | 'published' | 'draft';
    onStatusFilterChange: (filter: 'all' | 'published' | 'draft') => void;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export const MediaLibrarySidebar: React.FC<MediaLibrarySidebarProps> = ({
    selectedCategory,
    onCategoryChange,
    ownershipFilter,
    onOwnershipFilterChange,
    statusFilter,
    onStatusFilterChange,
    hasActiveFilters,
    onResetFilters,
}) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    id="media-category-tabs"
                    orientation="vertical"
                    value={selectedCategory}
                    onChange={(_e, value) => onCategoryChange(value)}
                    sx={{
                        '& .MuiTab-root': {
                            alignItems: 'flex-start',
                            textAlign: 'left',
                            minHeight: 48,
                        },
                    }}
                >
                    {CATEGORY_TABS.map((tab) => (
                        <Tab
                            id={`media-tab-${tab.value.toLowerCase()}`}
                            key={tab.value}
                            label={tab.label}
                            value={tab.value}
                        />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
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
                            id="media-btn-reset-filters"
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
        <Accordion id="media-filter-ownership" disableGutters elevation={0}>
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
        <Accordion id="media-filter-status" disableGutters elevation={0}>
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
