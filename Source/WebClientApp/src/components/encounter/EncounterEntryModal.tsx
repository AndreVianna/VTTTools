import {
    Backdrop,
    Box,
    Button,
    Link,
    Modal,
    Paper,
    Typography,
} from '@mui/material';
import type React from 'react';

export interface EncounterEntryModalProps {
    /** Whether the modal is open */
    open: boolean;
    /** The name of the encounter being entered */
    encounterName: string;
    /** Called when the user clicks OK to enter the encounter */
    onEnter: () => void;
    /** Called when the user clicks the help link */
    onHelpClick: () => void;
}

/**
 * Entry modal shown when entering a game session / encounter.
 * This modal serves two purposes:
 * 1. Informs the player they are entering a new scene
 * 2. Provides the user gesture required to unlock audio (browser autoplay policy)
 */
export const EncounterEntryModal: React.FC<EncounterEntryModalProps> = ({
    open,
    encounterName,
    onEnter,
    onHelpClick,
}) => {
    return (
        <Modal
            open={open}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    },
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 450 },
                    outline: 'none',
                }}
            >
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{
                            mb: 2,
                            color: 'text.secondary',
                        }}
                    >
                        Your character is being sent to a new scene
                    </Typography>

                    <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                            mb: 4,
                            fontWeight: 'bold',
                            color: 'text.primary',
                        }}
                    >
                        {encounterName}
                    </Typography>

                    <Button
                        id="btn-enter-encounter"
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={onEnter}
                        sx={{
                            px: 6,
                            py: 1.5,
                            mb: 3,
                        }}
                    >
                        OK
                    </Button>

                    <Box>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={onHelpClick}
                            sx={{
                                color: 'text.secondary',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                '&:hover': {
                                    color: 'primary.main',
                                },
                            }}
                        >
                            Click here to learn how to enable auto-play in your browser to avoid this message.
                        </Link>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
};
