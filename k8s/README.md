# Kubernetes Configuration for TACO Application

This directory contains the Kubernetes (k8s) configuration files necessary for deploying the TACO
application. The setup includes deployments and services for a web application, along with the
necessary ConfigMaps and Secrets for configuration and sensitive data management.

## Overview

- `webapp.yaml`: Defines the Deployment and Service for the web application.
- `config.yaml`: A ConfigMap providing configuration variables for the application.
- `secret.example.yaml`: An example Secret file template. You need to fill in the actual
  values for your environment.

## Deployment Instructions

1. **Prepare the Secret**: Copy `secret.example.yaml` to `secret.yaml` and
   fill in the actual values for your environment's sensitive data.

2. **Apply the ConfigMap**: Deploy the configuration to your cluster.
   ```
   kubectl apply -f config.yaml
   ```

3. **Apply the Secret**: Deploy the secrets to your cluster.
   ```
   kubectl apply -f secret.yaml
   ```

4. **Deploy the Web Application**: Deploy the web application along with its service.
   ```
   kubectl apply -f webapp.yaml
   ```

## Accessing the Services

- The web application is accessible through a NodePort service at `<NodeIP>:30000`.

## Environment Configuration

The application is configured to run in a `development` environment by default, as specified
in `config.yaml`. Adjust the `NODE_ENV` and `DEPLOYMENT_ENV` values as necessary for your
deployment scenario.

## Security

Ensure that the `secret.yaml` file is securely stored and managed, as it contains
sensitive information crucial for the application's security.

## Additional Notes

- The web application image is `tr0n/taco:1.1`, and it listens on port 3000.
- Adjust the `PUBLIC_SITE_URL` in `config.yaml` to match the real URL of your deployed
  services.
