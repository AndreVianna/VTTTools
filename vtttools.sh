#!/usr/bin/env zsh

# vtttools-wsl.sh - VttTools Development CLI for WSL2 + Podman
# Optimized for WSL2 environment with Podman as Docker replacement

# Script configuration - adjust these paths to match your project structure
SOLUTION_DIR="$(dirname "$0")/Source"  # Directory containing your solution
SOLUTION_FILE="VttTools.sln"           # Solution file name
APPHOST_DIR="$SOLUTION_DIR/AppHost"     # AppHost project directory
APPHOST_PROJECT="VttTools.AppHost.csproj"
PROJECT_FILE="AppHost/VttTools.AppHost.csproj"
MIGRATION_SERVICE_DIR="$SOLUTION_DIR/Data.MigrationService"  # Migration service directory
DATA_DIR="$SOLUTION_DIR/Data"  # Data project directory

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
    print -P "%F{cyan}VttTools Development CLI (WSL2 + Podman)%f"
    print -P ""
    print -P "%F{green}Usage:%f"
    print -P "  ./vtttools-wsl.sh [command] [options] [arguments]"
    print -P ""
    print -P "%F{green}Commands:%f"
    print -P "  run        Run the application (default command)"
    print -P "  build      Build the solution and exit"
    print -P "  test       Run tests and exit"
    print -P "  migration  Manage database migrations"
    print -P "  podman     Podman socket management"
    print -P "  help       Show this help message"
    print -P ""
    print -P "%F{green}Run Options:%f"
    print -P "  --build, -b     Build before running (default: use existing build)"
    print -P "  --clean, -c     Clean containers (default: preserve containers)"
    print -P ""
    print -P "%F{green}Test Options:%f"
    print -P "  --build, -b     Build before testing (default: use existing build)"
    print -P ""
    print -P "%F{green}Test Arguments:%f"
    print -P "  [test_name]     Run specific test (uses --filter, no code coverage)"
    print -P "                  If not specified, runs all tests with code coverage"
    print -P ""
    print -P "%F{green}Migration Commands:%f"
    print -P "  migration add [name]    Create a new migration"
    print -P "  migration remove        Remove the last migration"
    print -P "  migration list          List all migrations"
    print -P "  migration apply [name]  Apply migrations to database (optional name)"
    print -P "  migration revert        Revert all migrations"
    print -P ""
    print -P "%F{green}Podman Commands:%f"
    print -P "  podman start     Start Podman socket"
    print -P "  podman stop      Stop Podman socket"
    print -P "  podman status    Check Podman socket status"
    print -P "  podman restart   Restart Podman socket"
    print -P ""
    print -P "%F{green}Examples:%f"
    print -P "  ./vtttools-wsl.sh                          # Quick start (preserve containers)"
    print -P "  ./vtttools-wsl.sh run                      # Same as above"
    print -P "  ./vtttools-wsl.sh run -b                   # Build and run, preserve containers"
    print -P "  ./vtttools-wsl.sh run -c                   # Run with clean containers"
    print -P "  ./vtttools-wsl.sh run -b -c                # Build and run, clean containers"
    print -P "  ./vtttools-wsl.sh build                    # Build validation only"
    print -P "  ./vtttools-wsl.sh test                     # Run all tests with coverage"
    print -P "  ./vtttools-wsl.sh test -b                  # Build and run all tests"
    print -P "  ./vtttools-wsl.sh test ShouldValidateUser  # Run specific test (no coverage)"
    print -P "  ./vtttools-wsl.sh test -b GetUserTests     # Build and run specific test"
    print -P "  ./vtttools-wsl.sh migration add AddUser    # Create new migration"
    print -P "  ./vtttools-wsl.sh migration list           # Show all migrations"
    print -P "  ./vtttools-wsl.sh migration apply          # Apply all pending migrations"
    print -P "  ./vtttools-wsl.sh podman status            # Check container runtime"
    print -P ""
    print -P "%F{green}Development Workflow:%f"
    print -P "  1. ./vtttools-wsl.sh podman start          # Ensure container runtime"
    print -P "  2. ./vtttools-wsl.sh test -b               # Validate all tests"
    print -P "  3. ./vtttools-wsl.sh -c                    # Fresh start after validation"
    print -P "  4. ./vtttools-wsl.sh test FailingTest      # Debug individual failing test"
    print -P ""
    print -P "%F{yellow}WSL2 + Podman Notes:%f"
    print -P "  - Uses Podman instead of Docker (no licensing issues)"
    print -P "  - Optimized for WSL2 environment (no nested virtualization)"
    print -P "  - Automatically manages Podman socket for .NET Aspire"
    print -P "  - Uses $SOLUTION_FILE solution file for build and test operations"
    print -P "  - Mount propagation warnings are normal in WSL2 and can be ignored"
}

# Function to ensure WSL2 runtime directory exists
ensure_wsl_runtime_dir() {
    local runtime_dir="/run/user/$UID"
    local podman_dir="$runtime_dir/podman"
    
    if [[ ! -d "$runtime_dir" ]]; then
        log_info "Creating WSL2 runtime directory: $runtime_dir"
        sudo mkdir -p "$runtime_dir"
        sudo chown $USER:$USER "$runtime_dir"
        sudo chmod 700 "$runtime_dir"
    fi
    
    if [[ ! -d "$podman_dir" ]]; then
        log_info "Creating Podman runtime directory: $podman_dir"
        mkdir -p "$podman_dir"
    fi
    
    # Set XDG_RUNTIME_DIR for WSL2
    export XDG_RUNTIME_DIR="$runtime_dir"
}

# Function to start Podman socket for .NET Aspire compatibility
start_podman_socket() {
    local socket_path="/run/user/$UID/podman/podman.sock"
    
    # Check if socket is already running
    if [[ -S "$socket_path" ]]; then
        # Test if it's responsive
        if curl -s --unix-socket "$socket_path" http://localhost/version >/dev/null 2>&1; then
            log_success "Podman socket already running and responsive"
            return 0
        else
            log_warning "Podman socket exists but not responsive, restarting..."
            stop_podman_socket
        fi
    fi
    
    log_info "Starting Podman socket for .NET Aspire compatibility..."
    
    # Ensure runtime directory exists
    ensure_wsl_runtime_dir
    
    # Kill any hanging podman service processes
    pkill -f "podman.*system.*service" 2>/dev/null || true
    
    export PODMAN_USERNS=keep-id
    export BUILDAH_ISOLATION=chroot
    
    # Start the socket
    podman system service --time=0 unix://"$socket_path" &
    local socket_pid=$!
    
    # Wait for socket to be ready
    local max_attempts=30
    local attempt=0
    while [ ! -S "$socket_path" ] && [ $attempt -lt $max_attempts ]; do
        sleep 0.5
        attempt=$((attempt + 1))
    done
    
    if [ -S "$socket_path" ]; then
        # Test socket responsiveness
        if curl -s --unix-socket "$socket_path" http://localhost/version >/dev/null 2>&1; then
            log_success "Podman socket started successfully (PID: $socket_pid)"
            log_success "Socket path: $socket_path"
            return 0
        else
            log_error "Podman socket created but not responsive"
            return 1
        fi
    else
        log_error "Failed to create Podman socket"
        return 1
    fi
}

# Function to stop Podman socket
stop_podman_socket() {
    local socket_path="/run/user/$UID/podman/podman.sock"
    
    log_info "Stopping Podman socket..."
    
    # Kill podman service processes
    pkill -f "podman.*system.*service" 2>/dev/null || true
    
    # Remove socket file
    rm -f "$socket_path" 2>/dev/null || true
    
    # Wait a moment for cleanup
    sleep 1
    
    if [[ ! -S "$socket_path" ]]; then
        log_success "Podman socket stopped"
        return 0
    else
        log_warning "Socket file still exists, but processes stopped"
        return 0
    fi
}

# Function to check Podman socket status
check_podman_status() {
    local socket_path="/run/user/$UID/podman/podman.sock"
    
    log_info "Checking Podman socket status..."
    
    if [[ -S "$socket_path" ]]; then
        # Socket file exists, test responsiveness
        if curl -s --unix-socket "$socket_path" http://localhost/version >/dev/null 2>&1; then
            local version=$(curl -s --unix-socket "$socket_path" http://localhost/version | jq -r '.Version // "Unknown"' 2>/dev/null || echo "Connected")
            log_success "✅ Podman socket is running and responsive"
            log_success "   Version: $version"
            log_success "   Socket: $socket_path"
        else
            log_warning "⚠️  Podman socket exists but not responsive"
            log_warning "   Socket: $socket_path"
            log_info "   Try: ./vtttools-wsl.sh podman restart"
        fi
    else
        log_error "❌ Podman socket not running"
        log_error "   Expected: $socket_path"
        log_info "   Try: ./vtttools-wsl.sh podman start"
    fi
    
    # Show process information
    local podman_processes=$(pgrep -f "podman.*system.*service" 2>/dev/null || true)
    if [[ -n "$podman_processes" ]]; then
        log_info "Podman service processes: $podman_processes"
    else
        log_info "No Podman service processes running"
    fi
}

# Function to configure .NET Aspire environment for Podman
configure_aspire_environment() {
    local socket_path="/run/user/$UID/podman/podman.sock"
    
    log_info "Configuring .NET Aspire environment for Podman..."
    
    # Set Docker API compatibility
    export DOCKER_HOST="unix://$socket_path"
    export DOCKER_BUILDKIT=1
    
    # Aspire-specific settings
    export ASPIRE_CONTAINER_RUNTIME=podman
    export DOTNET_ASPIRE_CONTAINER_RUNTIME=podman
    
    log_success "Environment configured:"
    log_success "  DOCKER_HOST=$DOCKER_HOST"
    log_success "  Container Runtime: Podman"
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
    
    # Check solution file
    if [[ ! -f "$SOLUTION_DIR/$SOLUTION_FILE" ]]; then
        local abs_solution_file="$SOLUTION_DIR/$SOLUTION_FILE"
        log_error "Solution file not found at: $abs_solution_file"
        log_error "Please update SOLUTION_FILE in the script to match your solution file name"
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
    log_success "Solution file: $abs_solution_dir/$SOLUTION_FILE"
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

# Function to ensure container environment is ready
ensure_container_environment() {
    log_phase "ENVIRONMENT: Container Runtime Setup"
    
    # Configure WSL2 runtime directories
    ensure_wsl_runtime_dir
    
    # Start Podman socket if needed
    if ! start_podman_socket; then
        log_error "Failed to start Podman socket"
        log_error "Container operations will not work"
        return 1
    fi
    
    # Configure environment variables
    configure_aspire_environment
    
    log_success "Container environment ready for .NET Aspire"
    return 0
}

# Function to build the solution
build_solution() {
    log_phase "BUILD: Building Solution"
    
    log_info "Building project: $APPHOST_DIR"
    log_info "This ensures all projects compile correctly"
    
    # Change to solution directory for building
    local original_dir=$(pwd)
    cd "$SOLUTION_DIR" || {
        log_error "Failed to change to solution directory: $SOLUTION_DIR"
        return 1
    }
    
    # Build the specific solution file
    local build_command="dotnet build $SOLUTION_FILE --configuration Debug --verbosity minimal --nologo"
    log_info "Running: $build_command"
    
    if eval "$build_command"; then
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

# Function to build the AppHost project specifically
build_project() {
    log_phase "BUILD: Building AppHost Project"
    
    log_info "Building project: $APPHOST_PROJECT"
    log_info "This ensures all projects compile correctly"
    
    # Change to solution directory for building
    local original_dir=$(pwd)
    cd "$SOLUTION_DIR" || {
        log_error "Failed to change to solution directory: $SOLUTION_DIR"
        return 1
    }
    
    # Build the specific solution file
    local build_command="dotnet build $PROJECT_FILE --configuration Debug --verbosity minimal --nologo"
    log_info "Running: $build_command"
    
    if eval "$build_command"; then
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
    local test_filter=$1
    local collect_coverage=$2
    
    log_phase "TEST: Running Solution Tests"
    
    if [[ -n "$test_filter" ]]; then
        log_info "Running individual test: $test_filter"
        log_info "Code coverage disabled for individual test runs"
    else
        log_info "Running all tests with code coverage"
    fi
    
    log_info "Using build artifacts (--no-build)"
    log_info "Solution: $SOLUTION_FILE"
    
    # Change to solution directory for testing
    local original_dir=$(pwd)
    cd "$SOLUTION_DIR" || {
        log_error "Failed to change to solution directory: $SOLUTION_DIR"
        return 1
    }
    
    # Check if .runsettings file exists
    local runsettings_file=".runsettings"
    local settings_arg=""
    
    if [[ -f "$runsettings_file" ]]; then
        settings_arg="--settings .runsettings"
        log_info "Using test settings: .runsettings"
    else
        log_warning "No .runsettings file found in Source folder"
    fi
    
    # Build the test command for the specific solution
    local test_command="dotnet test $SOLUTION_FILE --no-build --nologo --configuration Debug --verbosity normal --logger trx"
    
    # Add settings if available
    if [[ -n "$settings_arg" ]]; then
        test_command="$test_command $settings_arg"
    fi
    
    # Add filter for individual tests
    if [[ -n "$test_filter" ]]; then
        test_command="$test_command --filter \"$test_filter\""
    fi
    
    # Add code coverage for full test runs only
    if [[ "$collect_coverage" == true ]]; then
        test_command="$test_command --collect:\"XPlat Code Coverage\""
    fi
    
    log_info "Running: $test_command"
    
    if eval "$test_command"; then
        if [[ -n "$test_filter" ]]; then
            log_success "Individual test completed successfully"
        else
            log_success "All tests passed successfully"
        fi
        cd "$original_dir"
        return 0
    else
        if [[ -n "$test_filter" ]]; then
            log_error "Individual test failed: $test_filter"
        else
            log_error "Some tests failed"
        fi
        log_error "Please review test results and fix failing tests"
        cd "$original_dir"
        return 1
    fi
}

# Function to clean up existing Aspire containers and networks
cleanup_container_state() {
    log_phase "CLEANUP: Resetting Container State"
    
    log_info "Cleaning up existing containers and networks..."
    
    # Check for running containers that might be from previous Aspire runs
    local running_containers=$(podman ps --format "{{.Names}}" 2>/dev/null | grep -E "(redis|storage|sql|aspire)" || true)
    local all_containers=$(podman ps -a --format "{{.Names}}" 2>/dev/null | grep -E "(redis|storage|sql|aspire)" || true)
    
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
    
    log_info "Running AppHost with Podman backend..."
    log_info "Using pre-built assemblies (--no-build)"
    
    # Change to AppHost directory
    local original_dir=$(pwd)
    cd "$APPHOST_DIR" || {
        log_error "Failed to change to AppHost directory: $APPHOST_DIR"
        return 1
    }
    
    local abs_apphost_dir=$(realpath .)
    log_info "Working directory: $abs_apphost_dir"
    log_info "Container backend: Podman via Docker API"
    log_info "Running: dotnet run --no-build --launch-profile https"
    
    # Always use --no-build since we should use pre-built assemblies
    dotnet run --no-build --launch-profile https || {
        log_error "Failed to start Aspire application"
        log_error "If you see assembly not found errors, try using --build (-b)"
        log_error "If you see container runtime errors, check: ./vtttools-wsl.sh podman status"
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
    local test_filter=""
    
    # Parse test command options and arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build|-b)
                rebuild=true
                shift
                ;;
            --*|-*)
                log_error "Unknown test option: $1"
                log_info "Use 'vtttools-wsl.sh help' for usage information"
                exit 1
                ;;
            *)
                # This should be the test name/filter
                if [[ -n "$test_filter" ]]; then
                    log_error "Only one test filter can be specified"
                    exit 1
                fi
                test_filter="$1"
                shift
                ;;
        esac
    done
    
    log_phase "COMMAND: Test"
    
    # Show what we're going to do
    if [[ -n "$test_filter" ]]; then
        if [[ "$rebuild" == true ]]; then
            print -P "%F{green}Mode: Build + Run Individual Test%f"
        else
            print -P "%F{yellow}Mode: Run Individual Test (existing build)%f"
        fi
        print -P "%F{blue}Test Filter: $test_filter%f"
    else
        if [[ "$rebuild" == true ]]; then
            print -P "%F{green}Mode: Build + Run All Tests%f"
        else
            print -P "%F{yellow}Mode: Run All Tests (existing build)%f"
        fi
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
    
    # Run tests - collect coverage only for full test runs (when no filter specified)
    local collect_coverage=false
    if [[ -z "$test_filter" ]]; then
        collect_coverage=true
    fi
    
    if ! run_tests "$test_filter" "$collect_coverage"; then
        exit 1
    fi
    
    log_success "Test command completed successfully"
}

cmd_run() {
    local rebuild=false
    local cleanup=false  # Default is now preserve (no cleanup)
    
    # Parse run command options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build|-b)
                rebuild=true
                shift
                ;;
            --clean|-c)
                cleanup=true  # Clean containers when this flag is used
                shift
                ;;
            *)
                log_error "Unknown run option: $1"
                log_info "Use 'vtttools-wsl.sh help' for usage information"
                exit 1
                ;;
        esac
    done
    
    log_phase "COMMAND: Run"
    
    # Show mode information
    if [[ "$rebuild" == true && "$cleanup" == true ]]; then
        print -P "%F{green}Mode: Fresh Start (build + clean containers + run)%f"
    elif [[ "$rebuild" == true ]]; then
        print -P "%F{green}Mode: Build and Run (preserve containers)%f"
    elif [[ "$cleanup" == true ]]; then
        print -P "%F{yellow}Mode: Clean Run (clean containers, use existing build)%f"
    else
        print -P "%F{blue}Mode: Quick Restart (preserve build and containers)%f"
    fi
    
    # Ensure container environment is ready
    if ! ensure_container_environment; then
        exit 1
    fi
    
    # Configure .NET environment
    configure_dotnet_environment
    
    # Build if requested
    if [[ "$rebuild" == true ]]; then
        if ! build_project; then
            exit 1
        fi
    else
        log_info "Using existing build artifacts"
    fi
    
    # Clean up containers only if cleanup is requested
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

# Podman management commands
cmd_podman() {
    local subcommand=""
    
    if [[ $# -eq 0 ]]; then
        log_error "Podman subcommand required"
        log_info "Available subcommands: start, stop, status, restart"
        log_info "Use 'vtttools-wsl.sh help' for usage information"
        exit 1
    fi
    
    subcommand=$1
    shift
    
    case $subcommand in
        start)
            ensure_wsl_runtime_dir
            start_podman_socket
            ;;
        stop)
            stop_podman_socket
            ;;
        status)
            check_podman_status
            ;;
        restart)
            stop_podman_socket
            sleep 1
            ensure_wsl_runtime_dir
            start_podman_socket
            ;;
        *)
            log_error "Unknown podman subcommand: $subcommand"
            log_info "Available subcommands: start, stop, status, restart"
            exit 1
            ;;
    esac
}

# Migration command implementations (same as original, but with validation)
cmd_migration() {
    local subcommand=""
    local migration_name=""
    
    # Parse migration subcommand and arguments
    if [[ $# -eq 0 ]]; then
        log_error "Migration subcommand required"
        log_info "Available subcommands: add, remove, list, apply, revert"
        log_info "Use 'vtttools-wsl.sh help' for usage information"
        exit 1
    fi
    
    subcommand=$1
    shift
    
    case $subcommand in
        add)
            if [[ $# -eq 0 ]]; then
                log_error "Migration name required for 'add' command"
                log_info "Usage: ./vtttools-wsl.sh migration add MigrationName"
                exit 1
            fi
            migration_name=$1
            migration_add "$migration_name"
            ;;
        remove)
            migration_remove
            ;;
        list)
            migration_list
            ;;
        apply)
            if [[ $# -gt 0 ]]; then
                migration_name=$1
            fi
            migration_apply "$migration_name"
            ;;
        revert)
            migration_revert
            ;;
        *)
            log_error "Unknown migration subcommand: $subcommand"
            log_info "Available subcommands: add, remove, list, apply, revert"
            exit 1
            ;;
    esac
}

# Function to validate migration service structure
validate_migration_service() {
    log_info "Validating migration service structure..."
    
    # Check data directory
    if [[ ! -d "$DATA_DIR" ]]; then
        local abs_data_dir=$(realpath "$DATA_DIR" 2>/dev/null || echo "$DATA_DIR")
        log_error "Data directory not found at: $abs_data_dir"
        log_error "Please ensure Data project exists"
        return 1
    fi
    
    # Check migration service directory
    if [[ ! -d "$MIGRATION_SERVICE_DIR" ]]; then
        local abs_migration_service_dir=$(realpath "$MIGRATION_SERVICE_DIR" 2>/dev/null || echo "$MIGRATION_SERVICE_DIR")
        log_error "Migration service directory not found at: $abs_migration_service_dir"
        log_error "Please ensure Data.MigrationService project exists"
        return 1
    fi
    
    log_success "Data directory: $(realpath "$DATA_DIR")"
    log_success "Migration service directory: $(realpath "$MIGRATION_SERVICE_DIR")"
    return 0
}

# Migration functions (same as original)
migration_add() {
    local migration_name=$1
    
    log_phase "MIGRATION: Adding Migration '$migration_name'"
    
    configure_dotnet_environment
    
    if ! validate_migration_service; then
        exit 1
    fi
    
    local original_dir=$(pwd)
    cd "$MIGRATION_SERVICE_DIR" || {
        log_error "Failed to change to migration service directory: $MIGRATION_SERVICE_DIR"
        return 1
    }
    
    log_info "Adding migration: $migration_name"
    log_info "Working directory: $(realpath .)"
    
    local migration_command="dotnet ef migrations add $migration_name"
    log_info "Running: $migration_command"
    
    if eval "$migration_command"; then
        log_success "Migration '$migration_name' created successfully"
        cd "$original_dir"
        return 0
    else
        log_error "Failed to create migration '$migration_name'"
        cd "$original_dir"
        return 1
    fi
}

migration_remove() {
    log_phase "MIGRATION: Removing Last Migration"
    
    configure_dotnet_environment
    
    if ! validate_migration_service; then
        exit 1
    fi
    
    local original_dir=$(pwd)
    cd "$MIGRATION_SERVICE_DIR" || {
        log_error "Failed to change to migration service directory: $MIGRATION_SERVICE_DIR"
        return 1
    }
    
    log_info "Removing last migration"
    log_info "Working directory: $(realpath .)"
    
    local migration_command="dotnet ef migrations remove --force"
    log_info "Running: $migration_command"
    
    if eval "$migration_command"; then
        log_success "Last migration removed successfully"
        cd "$original_dir"
        return 0
    else
        log_error "Failed to remove last migration"
        cd "$original_dir"
        return 1
    fi
}

migration_list() {
    log_phase "MIGRATION: Listing Migrations"
    
    configure_dotnet_environment
    
    if ! validate_migration_service; then
        exit 1
    fi
    
    local original_dir=$(pwd)
    cd "$MIGRATION_SERVICE_DIR" || {
        log_error "Failed to change to migration service directory: $MIGRATION_SERVICE_DIR"
        return 1
    }
    
    log_info "Listing all migrations"
    log_info "Working directory: $(realpath .)"
    
    local migration_command="dotnet ef migrations list"
    log_info "Running: $migration_command"
    
    if eval "$migration_command"; then
        log_success "Migration list completed successfully"
        cd "$original_dir"
        return 0
    else
        log_error "Failed to list migrations"
        cd "$original_dir"
        return 1
    fi
}

migration_apply() {
    local migration_name=$1
    
    if [[ -n "$migration_name" ]]; then
        log_phase "MIGRATION: Applying Migration to '$migration_name'"
    else
        log_phase "MIGRATION: Applying All Pending Migrations"
    fi
    
    configure_dotnet_environment
    
    if ! validate_migration_service; then
        exit 1
    fi
    
    local original_dir=$(pwd)
    cd "$MIGRATION_SERVICE_DIR" || {
        log_error "Failed to change to migration service directory: $MIGRATION_SERVICE_DIR"
        return 1
    }
    
    if [[ -n "$migration_name" ]]; then
        log_info "Applying migrations up to: $migration_name"
    else
        log_info "Applying all pending migrations"
    fi
    log_info "Working directory: $(realpath .)"
    
    local migration_command="dotnet ef database update"
    if [[ -n "$migration_name" ]]; then
        migration_command="$migration_command $migration_name"
    fi
    
    log_info "Running: $migration_command"
    
    if eval "$migration_command"; then
        if [[ -n "$migration_name" ]]; then
            log_success "Database updated to migration '$migration_name' successfully"
        else
            log_success "All pending migrations applied successfully"
        fi
        cd "$original_dir"
        return 0
    else
        log_error "Failed to apply migrations"
        cd "$original_dir"
        return 1
    fi
}

migration_revert() {
    log_phase "MIGRATION: Reverting All Migrations"
    
    configure_dotnet_environment
    
    if ! validate_migration_service; then
        exit 1
    fi
    
    local original_dir=$(pwd)
    cd "$MIGRATION_SERVICE_DIR" || {
        log_error "Failed to change to migration service directory: $MIGRATION_SERVICE_DIR"
        return 1
    }
    
    log_info "Reverting all migrations from database"
    log_info "Working directory: $(realpath .)"
    
    local migration_command="dotnet ef database update 0"
    log_info "Running: $migration_command"
    
    if eval "$migration_command"; then
        log_success "All migrations reverted successfully"
        cd "$original_dir"
        return 0
    else
        log_error "Failed to revert migrations"
        cd "$original_dir"
        return 1
    fi
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
            build|test|run|migration|podman|help)
                command=$1
                shift
                ;;
            --*|-*)
                # If first argument is an option, assume 'run' command
                command="run"
                ;;
            *)
                log_error "Unknown command: $1"
                log_info "Use 'vtttools-wsl.sh help' for usage information"
                exit 1
                ;;
        esac
    fi
    
    # Display banner
    print -P "\n%F{cyan}================================================%f"
    print -P "%F{cyan}    VttTools Development CLI (WSL2 + Podman)%f"
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
        migration)
            cmd_migration "$@"
            ;;
        podman)
            cmd_podman "$@"
            ;;
        help)
            show_usage
            ;;
    esac
}

# Execute main function with all command line arguments
main "$@"