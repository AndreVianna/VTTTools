import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import type React from 'react';
import { useState } from 'react';

export interface AutoplayHelpDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Called when the dialog should close */
    onClose: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`autoplay-tabpanel-${index}`}
            aria-labelledby={`autoplay-tab-${index}`}
        >
            {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `autoplay-tab-${index}`,
        'aria-controls': `autoplay-tabpanel-${index}`,
    };
}

interface BrowserInstructions {
    name: string;
    steps: string[];
}

const browserInstructions: BrowserInstructions[] = [
    {
        name: 'Chrome',
        steps: [
            'Click the lock icon (or tune icon) in the address bar',
            'Click "Site settings"',
            'Find "Sound" and change it to "Allow"',
            'Refresh the page',
        ],
    },
    {
        name: 'Firefox',
        steps: [
            'Click the lock icon in the address bar',
            'Click "Connection secure" or the site name',
            'Click "More Information"',
            'Go to the "Permissions" tab',
            'Find "Autoplay" and uncheck "Use Default"',
            'Select "Allow Audio and Video"',
            'Refresh the page',
        ],
    },
    {
        name: 'Safari',
        steps: [
            'Click "Safari" in the menu bar',
            'Select "Settings for This Website..." (or "Settings for [site name]...")',
            'Find "Auto-Play" and change it to "Allow All Auto-Play"',
            'Refresh the page',
        ],
    },
    {
        name: 'Edge',
        steps: [
            'Click the lock icon in the address bar',
            'Click "Site permissions"',
            'Find "Media autoplay" and change it to "Allow"',
            'Refresh the page',
        ],
    },
];

/**
 * Dialog showing browser-specific instructions for enabling autoplay.
 * This allows power users to skip the entry modal on future visits
 * by configuring their browser to always allow audio on this site.
 */
export const AutoplayHelpDialog: React.FC<AutoplayHelpDialogProps> = ({
    open,
    onClose,
}) => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="autoplay-help-dialog-title"
        >
            <DialogTitle id="autoplay-help-dialog-title">
                Enable Auto-Play in Your Browser
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    To skip the entry screen and hear audio automatically, you can
                    configure your browser to allow autoplay for this site. Select your
                    browser below for instructions:
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        aria-label="browser instructions tabs"
                        variant="fullWidth"
                    >
                        {browserInstructions.map((browser, index) => (
                            <Tab
                                key={browser.name}
                                label={browser.name}
                                {...a11yProps(index)}
                            />
                        ))}
                    </Tabs>
                </Box>

                {browserInstructions.map((browser, index) => (
                    <TabPanel key={browser.name} value={tabIndex} index={index}>
                        <Box component="ol" sx={{ pl: 2, m: 0 }}>
                            {browser.steps.map((step, stepIndex) => (
                                <Typography
                                    component="li"
                                    variant="body2"
                                    key={stepIndex}
                                    sx={{ mb: 1 }}
                                >
                                    {step}
                                </Typography>
                            ))}
                        </Box>
                    </TabPanel>
                ))}

                <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 2, color: 'text.secondary' }}
                >
                    Note: Browser settings may vary slightly depending on your version.
                    If you can&apos;t find the exact option, look for similar settings
                    related to sound, audio, or autoplay permissions.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
