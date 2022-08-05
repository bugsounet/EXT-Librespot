#!/bin/bash
# +-----------------------+
# | librespot uninstaller |
# | @bugsounet            |
# +-----------------------+

# get the installer directory
Installer_get_current_dir () {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"
source utils.sh
# module name
Installer_info "Welcome to EXT-Librespot"
Installer_info "This installer will remove librespot v0.3.1 release"
echo

echo
cd ../components
Installer_info "Deleting librespot directory..."
rm -rf librespot
Installer_success "Done."
echo
Installer_press_enter_to_continue
