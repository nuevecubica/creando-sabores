#!/usr/local/bin/fish

# Check Homebrew
if test -z (which brew)
  echo "Homebrew not found! Installing..."
  ruby -e "(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  echo "Follow instructions and try again!"
  exit 1
end

# Add Cask
brew update
brew tap caskroom/homebrew-cask
# Install
brew update
brew install brew-cask

brew cask install virtualbox
brew cask install vagrant

echo "Done! Run: ./run.sh"