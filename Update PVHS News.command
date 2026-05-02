#!/bin/zsh
set -u

cd /Users/riva/RIVA_CODE/pvhs_tools || {
  echo "Could not open the PVHS Tools folder."
  read -k 1 -s "?Press any key to close."
  exit 1
}

clear
echo "PVHS News Update"
echo "================"
echo ""
echo "ParentSquare will open automatically."
echo "If it asks you to sign in, sign in once and leave this window open."
echo ""
npm run news:pull
RESULT=$?

echo ""
if [ $RESULT -eq 0 ]; then
  echo "Done. News was updated locally. Review it, then commit and push when ready."
else
  echo "Something went wrong. Nothing was staged, committed, or pushed automatically."
fi

echo ""
read -k 1 -s "?Press any key to close."
