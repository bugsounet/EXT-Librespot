#!/bin/bash
# +---------------------+
# | librespot installer |
# | @bugsounet          |
# +---------------------+

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
cd ..

# module name
Installer_info "Welcome to EXT-Librespot setup"
Installer_info "This installer will install librespot from raspotify packet"
echo

# check dependencies
dependencies=(curl)
Installer_info "Checking all dependencies..."
Installer_update_dependencies || exit 255
Installer_success "All Dependencies needed are installed !"

echo

# install raspotify
Installer_info "Install Raspotify..."
(curl -sL https://dtcooper.github.io/raspotify/install.sh | sh) || {
  Installer_error "Error detected !"
  exit 255
}
Installer_success "Done."

echo

Installer_info "Copy Librespot binary file..."
cp /usr/bin/librespot components/librespot/librespot || {
  Installer_error "Copy error !"
  exit 255
}
Installer_success "Done."

echo

Installer_info "Remove Raspotify..."
sudo apt-get remove raspotify -y || {
  Installer_error "Remove error !"
  exit 255
}
Installer_success "Done."

echo

Installer_info "Clean apt..."
sudo rm -f /etc/apt/sources.list.d/raspotify.list
sudo apt-get update
Installer_success "Done."

echo

Installer_press_enter_to_continue
