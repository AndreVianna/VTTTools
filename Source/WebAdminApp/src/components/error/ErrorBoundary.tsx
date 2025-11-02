import { Component, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: unknown) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box id="error-boundary-fallback" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4">Something went wrong</Typography>
                    <Typography variant="body1" sx={{ my: 2 }}>
                        {this.state.error?.message}
                    </Typography>
                    <Button
                        id="btn-error-reload"
                        variant="contained"
                        onClick={() => window.location.reload()}
                    >
                        Reload Application
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}
