#!/usr/bin/env zsh

# vtttools.sh - VttTools Development CLI
# A clean command-line interface for building, testing, and running the VttTools application

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
    print -P "%F{cyan}VttTools Development CLI%f"
    print -P ""
    print -P "%F{green}Usage:%f"
    print -P "  ./vtttools.sh [command] [options] [arguments]"
    print -P ""
    print -P "%F{green}Commands:%f"
    print -P "  run        Run the application (default command)"
    print -P "  build      Build the solution and exit"
    print -P "  test       Run tests and exit"
    print -P "  migration  Manage database migrations"
    print -P "  help       Show this help message"
    print -P ""
    print -P "%F{green}Run Options:%f"
    print -P "  --rebuild, -r   Build before running (default: use existing build)"
    print -P "  --preserve, -p  Preserve containers (default: clean containers)"
    print -P ""
    print -P "%F{green}Test Options:%f"
    print -P "  --rebuild, -r   Build before testing (default: use existing build)"
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
    print -P "%F{green}Examples:%f"
    print -P "  ./vtttools.sh                          # Fresh start (clean containers)"
    print -P "  ./vtttools.sh run                      # Same as above"
    print -P "  ./vtttools.sh run -r                   # Build and run, clean containers"
    print -P "  ./vtttools.sh run -p                   # Run preserving containers"
    print -P "  ./vtttools.sh run -r -p                # Build and run, preserve containers"
    print -P "  ./vtttools.sh build                    # Build validation only"
    print -P "  ./vtttools.sh test                     # Run all tests with coverage"
    print -P "  ./vtttools.sh test -r                  # Build and run all tests"
    print -P "  ./vtttools.sh test ShouldValidateUser  # Run specific test (no coverage)"
    print -P "  ./vtttools.sh test -r GetUserTests     # Build and run specific test"
    print -P "  ./vtttools.sh migration add AddUser    # Create new migration"
    print -P "  ./vtttools.sh migration list           # Show all migrations"
    print -P "  ./vtttools.sh migration apply          # Apply all pending migrations"
    print -P ""
    print -P "%F{green}Development Workflow:%f"
    print -P "  1. ./vtttools.sh test -r               # Validate all tests"
    print -P "  2. ./vtttools.sh                       # Fresh start after validation"
    print -P "  3. ./vtttools.sh test FailingTest      # Debug individual failing test"
    print -P ""
    print -P "%F{yellow}Notes:%f"
    print -P "  - Uses $SOLUTION_FILE solution file for build and test operations"
    print -P "  - Uses .runsettings file from Source folder if available"
    print -P "  - Individual tests run without code coverage for faster execution"
    print -P "  - Full test runs include code coverage collection"
    print -P "  - Test filter supports any dotnet test --filter expression"
    print -P "  - Run command uses vtttools-namespace.sh for container environment setup"
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

# Function to build the solution in normal environment
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

# Function to check if we need namespace and delegate to wrapper if necessary
ensure_container_environment() {
    # Only set up namespace for run command (which needs containers)
    local needs_namespace=false
    
    # Check if this is a run command (default or explicit)
    if [[ $# -eq 0 ]] || [[ "$1" == "run" ]] || [[ "$1" == --* ]]; then
        needs_namespace=true
    fi
    
    # If we don't need namespace, skip this entirely
    if [[ "$needs_namespace" == false ]]; then
        return 0
    fi
    
    # If already configured, we're good
    if [[ -n "$NAMESPACE_CONFIGURED" ]]; then
        log_success "Running in configured namespace environment"
        return 0
    fi
    
    # Check if we're already in a shared mount environment
    local mount_propagation=$(findmnt -n -o PROPAGATION / 2>/dev/null)
    if [[ "$mount_propagation" == "shared" ]]; then
        log_info "Already in container-friendly environment"
        export NAMESPACE_CONFIGURED=1
        return 0
    fi
    
    # We need to set up the namespace - delegate to wrapper script
    local script_dir="$(dirname "$0")"
    local namespace_wrapper="$script_dir/vtttools-namespace.sh"
    
    if [[ ! -f "$namespace_wrapper" ]]; then
        log_error "Namespace wrapper script not found: $namespace_wrapper"
        log_error "Please ensure vtttools-namespace.sh is in the same directory as vtttools.sh"
        exit 1
    fi
    
    log_info "Delegating to namespace wrapper for container environment setup..."
    exec "$namespace_wrapper" "$@"
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
    local test_filter=""
    
    # Parse test command options and arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --rebuild|-r)
                rebuild=true
                shift
                ;;
            --*|-*)
                log_error "Unknown test option: $1"
                log_info "Use 'vtttools.sh help' for usage information"
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
    local cleanup=true  # Default is now cleanup (fresh start)
    
    # Parse run command options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --rebuild|-r)
                rebuild=true
                shift
                ;;
            --preserve|-p)
                cleanup=false  # Preserve containers when this flag is used
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
        print -P "%F{green}Mode: Build and Run (preserve containers)%f"
    elif [[ "$cleanup" == true ]]; then
        print -P "%F{yellow}Mode: Clean Run (clean containers, use existing build)%f"
    else
        print -P "%F{blue}Mode: Quick Restart (preserve build and containers)%f"
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
    
    # Clean up containers unless preservation is requested
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

# Migration command implementations
cmd_migration() {
    local subcommand=""
    local migration_name=""
    
    # Parse migration subcommand and arguments
    if [[ $# -eq 0 ]]; then
        log_error "Migration subcommand required"
        log_info "Available subcommands: add, remove, list, apply, revert"
        log_info "Use 'vtttools.sh help' for usage information"
        exit 1
    fi
    
    subcommand=$1
    shift
    
    case $subcommand in
        add)
            if [[ $# -eq 0 ]]; then
                log_error "Migration name required for 'add' command"
                log_info "Usage: ./vtttools.sh migration add MigrationName"
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

# Function to add a new migration
migration_add() {
    local migration_name=$1
    
    log_phase "MIGRATION: Adding Migration '$migration_name'"
    
    # Configure .NET environment
    configure_dotnet_environment
    
    # Validate migration service structure
    if ! validate_migration_service; then
        exit 1
    fi
    
    # Change to migration service directory for migration operations
    local original_dir=$(pwd)
    cd "$MIGRATION_SERVICE_DIR" || {
        log_error "Failed to change to migration service directory: $MIGRATION_SERVICE_DIR"
        return 1
    }
    
    log_info "Adding migration: $migration_name"
    log_info "Working directory: $(realpath .)"
    
    # Execute migration add command from migration service directory
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

# Function to remove the last migration
migration_remove() {
    log_phase "MIGRATION: Removing Last Migration"
    
    # Configure .NET environment
    configure_dotnet_environment
    
    # Validate migration service structure
    if ! validate_migration_service; then
        exit 1
    fi
    
    # Change to migration service directory for migration operations
    local original_dir=$(pwd)
    cd "$MIGRATION_SERVICE_DIR" || {
        log_error "Failed to change to migration service directory: $MIGRATION_SERVICE_DIR"
        return 1
    }
    
    log_info "Removing last migration"
    log_info "Working directory: $(realpath .)"
    
    # Execute migration remove command from migration service directory (force flag to avoid database check)
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

# Function to list all migrations
migration_list() {
    log_phase "MIGRATION: Listing Migrations"
    
    # Configure .NET environment
    configure_dotnet_environment
    
    # Validate migration service structure
    if ! validate_migration_service; then
        exit 1
    fi
    
    # Change to migration service directory for migration operations
    local original_dir=$(pwd)
    cd "$MIGRATION_SERVICE_DIR" || {
        log_error "Failed to change to migration service directory: $MIGRATION_SERVICE_DIR"
        return 1
    }
    
    log_info "Listing all migrations"
    log_info "Working directory: $(realpath .)"
    
    # Execute migration list command from migration service directory
    local migration_command="dotnet ef migrations list --force"
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

# Function to apply migrations to database
migration_apply() {
    local migration_name=$1
    
    if [[ -n "$migration_name" ]]; then
        log_phase "MIGRATION: Applying Migration to '$migration_name'"
    else
        log_phase "MIGRATION: Applying All Pending Migrations"
    fi
    
    # Configure .NET environment
    configure_dotnet_environment
    
    # Validate migration service structure
    if ! validate_migration_service; then
        exit 1
    fi
    
    # Change to migration service directory for migration operations
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
    
    # Execute migration apply command from migration service directory
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

# Function to revert all migrations
migration_revert() {
    log_phase "MIGRATION: Reverting All Migrations"
    
    # Configure .NET environment
    configure_dotnet_environment
    
    # Validate migration service structure
    if ! validate_migration_service; then
        exit 1
    fi
    
    # Change to migration service directory for migration operations
    local original_dir=$(pwd)
    cd "$MIGRATION_SERVICE_DIR" || {
        log_error "Failed to change to migration service directory: $MIGRATION_SERVICE_DIR"
        return 1
    }
    
    log_info "Reverting all migrations from database"
    log_info "Working directory: $(realpath .)"
    
    # Execute migration revert command from migration service directory
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
    # Check and setup container environment FIRST, before any other processing
    # Only for run commands (which actually need containers)
    if [[ $# -eq 0 ]] || [[ "$1" == "run" ]] || [[ "$1" == --* ]]; then
        ensure_container_environment "$@"
    fi
    
    # Validate project structure
    if ! validate_project_structure; then
        exit 1
    fi
    
    # Parse command normally
    local command="run"  # Default command
    
    if [[ $# -gt 0 ]]; then
        case $1 in
            build|test|run|migration|help)
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
        migration)
            cmd_migration "$@"
            ;;
        help)
            show_usage
            ;;
    esac
}

# Execute main function with all command line arguments
main "$@"