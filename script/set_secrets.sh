#!/bin/bash

REPO="ImmrBhattarai/restaurant-app-gke"
SECRETS_FILE="github-secrets.txt"

echo "Reading secrets from $SECRETS_FILE and setting them for $REPO..."
echo "--------------------------------------------------------"

# Read the file and export variables to the current shell
source "$SECRETS_FILE"

# List of secrets to process
SECRET_NAMES=(
    DOCKERHUB_USERNAME 
    DOCKERHUB_TOKEN 
    GCP_PROJECT_ID 
    GKE_CLUSTER_NAME 
    GKE_CLUSTER_ZONE 
    GCP_SA_KEY
)

for SECRET_NAME in "${SECRET_NAMES[@]}"; do
    # Get the value from the shell environment
    SECRET_VALUE=$(eval echo \$$SECRET_NAME)

    # Use the GitHub CLI to set the secret
    echo "$SECRET_VALUE" | gh secret set "$SECRET_NAME" --repo "$REPO"
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully set secret: $SECRET_NAME"
    else
        echo "❌ Failed to set secret: $SECRET_NAME"
    fi
done

echo "--------------------------------------------------------"
echo "Done setting secrets."
