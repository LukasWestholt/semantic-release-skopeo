FROM quay.io/skopeo/stable:latest

RUN dnf -y update && dnf -y install nodejs git && \
    dnf clean all && rm -rf /var/cache /var/log/dnf* /var/log/yum.*


# Github Actions mounts over the working directory, so we don't set WORDIR
# Learn about more Github Action behavior here: https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-docker-container-action

# Copy the entrypoint script into the image
COPY entrypoint.sh /entrypoint.sh

# Make the script executable
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
