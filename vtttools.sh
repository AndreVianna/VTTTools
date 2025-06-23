#!/usr/bin/env zsh

# vtttools.sh - VttTools Development CLI
# A clean command-line interface for building, testing, and running the VttTools application

# Script configuration - adjust these paths to match your project structure
SOLUTION_DIR="$(dirname "$0")/Source"  # Directory containing your solution
SOLUTION_FILE="VttTools.sln"  # Directory containing your solution
APPHOST_DIR="$SOLUTION_DIR/AppHost"    # AppHost project directory
APPHOST_PROJECT="VttTools.AppHost.csproj"

# Color codes for better terminal output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Logging functions with improved visual hierarchy
log_phase() {
    print -P "\n%F{cyan}=== $1 ===%f"
}

log_info() {
    print -P "%F{blue}[INFO]%f $1"
}

log_success() {
    print -P "%F{green}[SUCCESS]%f $1"
}

log_warning() {
    print -P "%F{yellow}[WARNING]%f $1"
}

log_error() {
    print -P "%F{red}[ERROR]%f $1"
}

# Function to display usage information
show_usage() {
    print -P "%F{cyan}VttTools Development CLI%f"
    print -P ""
    print -P "%F{green}Usage:%f"
    print -P "  ./vtttools.sh [command] [options]"
    print -P ""
    print -P "%F{green}Commands:%f"
    print -P "  run     Run the application (default command)"
    print -P "  build   Build the solution and exit"
    print -P "  test    Run tests and exit"
    print -P "  help    Show this help message"
    print -P ""
    print -P "%F{green}Run Options:%f"
    print -P "  --rebuild, -r   Build before running (default: use existing build)"
    print -P "  --cleanup, -c   Reset containers (default: preserve containers)"
    print -P ""
    print -P "%F{green}Test Options:%f"
    print -P "  --rebuild, -r   Build before testing (default: use existing build)"
    print -P ""
    print -P "%F{green}Examples:%f"
    print -P "  ./vtttools.sh                    # Quick restart (preserve state)"
    print -P "  ./vtttools.sh run                # Same as above"
    print -P "  ./vtttools.sh run -r             # Build and run, reset containers"
    print -P "  ./vtttools.sh run -c             # Run with clean containers"
    print -P "  ./vtttools.sh run -r -c          # Fresh start (build + clean containers)"
    print -P "  ./vtttools.sh build              # Build validation only"
    print -P "  ./vtttools.sh test               # Test existing build"
    print -P "  ./vtttools.sh test -r            # Build and test"
    print -P ""
    print -P "%F{green}Development Workflow:%f"
    print -P "  1. ./vtttools.sh test -r         # Validate build and tests"
    print -P "  2. ./vtttools.sh                 # Quick run after validation"
    print -P "  3. ./vtttools.sh -c              # Clean restart if needed"
}

# Function to validate that required directories and files exist
validate_project_structure() {
    log_info "Validating project structure..."
    
    # Check solution directory
    if [[ ! -d "$SOLUTION_DIR" ]]; then
        local abs_solution_dir=$(realpath "$SOLUTION_DIR" 2>/dev/null || echo "$SOLUTION_DIR")
        log_error "Solution directory not found at: $abs_solution_dir"
        log_error "Please update SOLUTION_DIR in the script to point to your solution directory"
        return 1
    fi
    
    # Check AppHost directory
    if [[ ! -d "$APPHOST_DIR" ]]; then
        local abs_apphost_dir=$(realpath "$APPHOST_DIR" 2>/dev/null || echo "$APPHOST_DIR")
        log_error "AppHost directory not found at: $abs_apphost_dir"
        log_error "Please update APPHOST_DIR in the script"
        return 1
    fi
    
    # Check AppHost project file
    if [[ ! -f "$APPHOST_DIR/$APPHOST_PROJECT" ]]; then
        local abs_apphost_path="$APPHOST_DIR/$APPHOST_PROJECT"
        log_error "AppHost project not found at: $abs_apphost_path"
        log_error "Please verify the APPHOST_PROJECT filename in the script"
        return 1
    fi
    
    local abs_solution_dir=$(realpath "$SOLUTION_DIR")
    local abs_apphost_dir=$(realpath "$APPHOST_DIR")
    
    log_success "Solution directory: $abs_solution_dir"
    log_success "AppHost project: $abs_apphost_dir/$APPHOST_PROJECT"
    return 0
}

# Function to configure .NET environment to use user installation
configure_dotnet_environment() {
    log_info "Configuring .NET environment..."
    
    # Set up environment to prefer user .NET installation
    local user_dotnet_path="/home/andre/.dotnet"
    local user_dotnet_bin="$user_dotnet_path"
    
    # Check if user .NET installation exists
    if [[ -f "$user_dotnet_bin/dotnet" ]]; then
        log_info "Found user .NET installation at: $user_dotnet_path"
        
        # Configure environment variables to use user installation
        export DOTNET_ROOT="$user_dotnet_path"
        export PATH="$user_dotnet_bin:$PATH"
        
        # Verify the configuration worked
        local dotnet_version=$(dotnet --version 2>/dev/null)
        local dotnet_path=$(which dotnet 2>/dev/null)
        
        log_success ".NET Environment configured:"
        log_success "  Version: $dotnet_version"
        log_success "  Path: $dotnet_path"
        
        # Additional verification - check if we're using the user installation
        if [[ "$dotnet_path" == "$user_dotnet_bin/dotnet" ]]; then
            log_success "Using user .NET installation (correct)"
        else
            log_warning "Still using system .NET installation: $dotnet_path"
            log_warning "Expected: $user_dotnet_bin/dotnet"
        fi
    else
        log_warning "User .NET installation not found at: $user_dotnet_path"
        log_warning "Using system .NET installation"
        
        local dotnet_version=$(dotnet --version 2>/dev/null)
        local dotnet_path=$(which dotnet 2>/dev/null)
        log_info "Current .NET: $dotnet_version at $dotnet_path"
    fi
}

# Function to build the solution in normal environment
build_solution() {
    log_phase "BUILD: Building Solution"
    
    log_info "Building solution..."
    log_info "This ensures all projects compile correctly"
    
    # Change to solution directory for building
    local original_dir=$(pwd)
    cd "$SOLUTION_DIR" || {
        log_error "Failed to change to solution directory: $SOLUTION_DIR"
        return 1
    }
    
    # Build the entire solution
    log_info "Running: dotnet build $SOLUTION_FILE --configuration Debug --verbosity minimal"
    
    if dotnet build $SOLUTION_FILE --configuration Debug --verbosity minimal; then
        log_success "Solution built successfully"
        cd "$original_dir"
        return 0
    else
        log_error "Solution build failed"
        log_error "Please fix compilation errors before continuing"
        cd "$original_dir"
        return 1
    fi
}

# Function to run tests for the solution
run_tests() {
    log_phase "TEST: Running Solution Tests"
    
    log_info "Running tests using build artifacts"
    log_info "This will execute all test projects in the solution"
    
    # Change to solution directory for testing
    local original_dir=$(pwd)
    cd "$SOLUTION_DIR" || {
        log_error "Failed to change to solution directory: $SOLUTION_DIR"
        return 1
    }
    
    # Always run tests with --no-build since we should use existing build artifacts
    local test_command="dotnet test $SOLUTION_FILE --no-build --configuration Debug --verbosity normal --logger trx --collect:\"XPlat Code Coverage\""
    log_info "Running: $test_command"
    
    if eval "$test_command"; then
        log_success "All tests passed successfully"
        cd "$original_dir"
        return 0
    else
        log_error "Some tests failed"
        log_error "Please review test results and fix failing tests"
        cd "$original_dir"
        return 1
    fi
}

# Function to check if we're running in a properly configured namespace
check_namespace_environment() {
    local mount_propagation=$(findmnt -n -o PROPAGATION /)
    if [[ "$mount_propagation" == "shared" ]]; then
        return 0  # Already in namespace
    else
        return 1  # Need to create namespace
    fi
}

# Function to detect current shell for consistent namespace re-execution
detect_current_shell() {
    if [[ -n "$ZSH_VERSION" ]]; then
        echo "zsh"
    elif [[ -n "$BASH_VERSION" ]]; then
        echo "bash"
    else
        echo "sh"
    fi
}

# Function to create container-friendly environment using user namespaces
setup_container_environment() {
    log_info "Setting up container-friendly environment..."
    log_info "Creating user namespace with shared mount propagation..."
    
    local current_shell=$(detect_current_shell)
    
    # Create namespace and re-execute script within it
    exec unshare --user --mount --map-root-user --propagation shared $current_shell -c "
        # Configure shared mount propagation within the namespace
        mount --make-shared / 2>/dev/null || {
            print -P '%F{red}[ERROR]%f Failed to configure mount propagation'
            exit 1
        }
        
        # Verify the configuration succeeded
        if [[ \$(findmnt -n -o PROPAGATION /) == 'shared' ]]; then
            print -P '%F{green}[SUCCESS]%f Container environment configured successfully'
        else
            print -P '%F{red}[ERROR]%f Mount propagation configuration failed'
            exit 1
        fi
        
        # Mark that we're now in the configured namespace
        export NAMESPACE_CONFIGURED=1
        
        # Re-execute this script with the same arguments
        exec '$0' \$*
    "
}

# Function to clean up existing Aspire containers and networks
cleanup_container_state() {
    log_phase "CLEANUP: Resetting Container State"
    
    log_info "Cleaning up existing containers and networks..."
    
    # Check for running containers that might be from previous Aspire runs
    local running_containers=$(podman ps --format "{{.Names}}" 2>/dev/null | grep -E "(redis|storage|aspire)" || true)
    local all_containers=$(podman ps -a --format "{{.Names}}" 2>/dev/null | grep -E "(redis|storage|aspire)" || true)
    
    if [[ -n "$running_containers" ]]; then
        log_info "Stopping running containers..."
        echo "$running_containers" | while read container; do
            podman stop "$container" 2>/dev/null || log_warning "Failed to stop container: $container"
        done
        log_success "Stopped running containers"
    else
        log_info "No running containers found"
    fi
    
    if [[ -n "$all_containers" ]]; then
        log_info "Removing existing containers to clear network state..."
        echo "$all_containers" | while read container; do
            podman rm "$container" 2>/dev/null || log_warning "Failed to remove container: $container"
        done
        log_success "Removed existing containers"
    else
        log_info "No existing containers found"
    fi
    
    # Check for Aspire-related networks
    local aspire_networks=$(podman network ls --format "{{.Name}}" 2>/dev/null | grep -E "(aspire|default-aspire)" || true)
    
    if [[ -n "$aspire_networks" ]]; then
        log_info "Removing existing Aspire networks..."
        echo "$aspire_networks" | while read network; do
            # Only remove if it's not the default podman network
            if [[ "$network" != "podman" ]]; then
                podman network rm "$network" 2>/dev/null || log_warning "Failed to remove network: $network"
            fi
        done
        log_success "Cleaned up Aspire networks"
    else
        log_info "No Aspire networks found"
    fi
    
    # Prune unused networks to clean up any orphaned state
    log_info "Pruning unused networks..."
    podman network prune --force 2>/dev/null || log_warning "Network prune failed (this is usually harmless)"
    
    log_success "Container cleanup completed - ready for fresh Aspire run"
}

# Function to run the Aspire application
run_aspire_application() {
    log_phase "RUN: Starting Aspire Application"
    
    log_info "Running AppHost in container-friendly environment..."
    log_info "Using pre-built assemblies (--no-build)"
    
    # Change to AppHost directory
    local original_dir=$(pwd)
    cd "$APPHOST_DIR" || {
        log_error "Failed to change to AppHost directory: $APPHOST_DIR"
        return 1
    }
    
    local abs_apphost_dir=$(realpath .)
    log_info "Working directory: $abs_apphost_dir"
    log_info "Running: dotnet run --no-build --launch-profile https"
    
    # Always use --no-build since we should use pre-built assemblies
    dotnet run --no-build --launch-profile https || {
        log_error "Failed to start Aspire application"
        log_error "If you see assembly not found errors, try using --rebuild"
        cd "$original_dir"
        return 1
    }
    
    cd "$original_dir"
    return 0
}

# Command implementations
cmd_build() {
    log_phase "COMMAND: Build"
    
    # Configure .NET environment
    configure_dotnet_environment
    
    # Build the solution
    if ! build_solution; then
        exit 1
    fi
    
    log_success "Build command completed successfully"
}

cmd_test() {
    local rebuild=false
    
    # Parse test command options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --rebuild|-r)
                rebuild=true
                shift
                ;;
            *)
                log_error "Unknown test option: $1"
                log_info "Use 'vtttools.sh help' for usage information"
                exit 1
                ;;
        esac
    done
    
    log_phase "COMMAND: Test"
    
    # Configure .NET environment
    configure_dotnet_environment
    
    # Build if requested
    if [[ "$rebuild" == true ]]; then
        if ! build_solution; then
            exit 1
        fi
    else
        log_info "Using existing build artifacts"
    fi
    
    # Run tests
    if ! run_tests; then
        exit 1
    fi
    
    log_success "Test command completed successfully"
}

cmd_run() {
    local rebuild=false
    local cleanup=false
    
    # Parse run command options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --rebuild|-r)
                rebuild=true
                shift
                ;;
            --cleanup|-c)
                cleanup=true
                shift
                ;;
            *)
                log_error "Unknown run option: $1"
                log_info "Use 'vtttools.sh help' for usage information"
                exit 1
                ;;
        esac
    done
    
    log_phase "COMMAND: Run"
    
    # Show mode information
    if [[ "$rebuild" == true && "$cleanup" == true ]]; then
        print -P "%F{green}Mode: Fresh Start (build + clean containers + run)%f"
    elif [[ "$rebuild" == true ]]; then
        print -P "%F{green}Mode: Build and Run (reset containers)%f"
    elif [[ "$cleanup" == true ]]; then
        print -P "%F{yellow}Mode: Clean Run (reset containers, use existing build)%f"
    else
        print -P "%F{blue}Mode: Quick Restart (preserve build and containers)%f"
    fi
    
    # Configure .NET environment
    configure_dotnet_environment
    
    # Build if requested
    if [[ "$rebuild" == true ]]; then
        if ! build_solution; then
            exit 1
        fi
    else
        log_info "Using existing build artifacts"
    fi
    
    # Set up container environment if needed
    if [[ -z "$NAMESPACE_CONFIGURED" ]]; then
        if ! check_namespace_environment; then
            log_info "Setting up container environment..."
            setup_container_environment "$@"
        else
            log_info "Already in container-friendly environment"
        fi
    else
        log_success "Running in configured namespace environment"
    fi
    
    # Clean up containers if requested
    if [[ "$cleanup" == true ]]; then
        cleanup_container_state
    else
        log_info "Preserving existing containers and networks"
    fi
    
    # Run the application
    if ! run_aspire_application; then
        exit 1
    fi
    
    log_success "Run command completed successfully"
}

# Main script execution logic
main() {
    # Validate project structure first
    if ! validate_project_structure; then
        exit 1
    fi
    
    # Parse command
    local command="run"  # Default command
    
    if [[ $# -gt 0 ]]; then
        case $1 in
            build|test|run|help)
                command=$1
                shift
                ;;
            --*|-*)
                # If first argument is an option, assume 'run' command
                command="run"
                ;;
            *)
                log_error "Unknown command: $1"
                log_info "Use 'vtttools.sh help' for usage information"
                exit 1
                ;;
        esac
    fi
    
    # Display banner
    print -P "\n%F{cyan}================================================%f"
    print -P "%F{cyan}    VttTools Development CLI%f"
    print -P "%F{cyan}================================================%f"
    
    # Execute the appropriate command
    case $command in
        build)
            cmd_build "$@"
            ;;
        test)
            cmd_test "$@"
            ;;
        run)
            cmd_run "$@"
            ;;
        help)
            show_usage
            ;;
    esac
}

# Execute main function with all command line arguments
main "$@"