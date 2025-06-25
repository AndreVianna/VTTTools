#!/usr/bin/env zsh

# vtttools-namespace.sh - Namespace wrapper for VttTools CLI
# This script sets up the user namespace and then calls the main vtttools.sh script

# Color codes for output
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Function to detect current shell
detect_current_shell() {
    if [[ -n "$ZSH_VERSION" ]]; then
        echo "zsh"
    elif [[ -n "$BASH_VERSION" ]]; then
        echo "bash"
    else
        echo "sh"
    fi
}

# Main namespace setup function
main() {
    local script_dir="$(dirname "$0")"
    local main_script="$script_dir/vtttools.sh"
    local current_shell=$(detect_current_shell)
    
    # Check if main script exists
    if [[ ! -f "$main_script" ]]; then
        echo -e "${RED}[ERROR]${NC} Main script not found: $main_script"
        exit 1
    fi
    
    echo "[INFO] Setting up container-friendly environment..."
    echo "[INFO] Creating user namespace with shared mount propagation..."
    
    # Build argument string for re-execution
    local args_string=""
    for arg in "$@"; do
        # Properly quote each argument to handle spaces and special characters
        args_string="$args_string '$(printf '%s' "$arg" | sed "s/'/'\\\\''/g")'"
    done
    
    # Create namespace and execute main script within it
    exec unshare --user --mount --map-root-user --propagation shared $current_shell -c "
        # Configure shared mount propagation within the namespace
        mount --make-shared / 2>/dev/null || {
            echo -e '${RED}[ERROR]${NC} Failed to configure mount propagation'
            exit 1
        }
        
        # Verify the configuration succeeded
        if [[ \$(findmnt -n -o PROPAGATION /) == 'shared' ]]; then
            echo -e '${GREEN}[SUCCESS]${NC} Container environment configured successfully'
        else
            echo -e '${RED}[ERROR]${NC} Mount propagation configuration failed'
            exit 1
        fi
        
        # Mark that we're now in the configured namespace
        export NAMESPACE_CONFIGURED=1
        
        # Execute the main script with all original arguments
        eval \"$main_script\" $args_string
    "
}

# Execute main function with all arguments
main "$@"