# Auth0 redirector

Organizations using federated SSO for auth0 need to define one of them as default.
Users in other domains than the default get then redirected to the wrong SSO page
when they click on a link requiring auth0 authentication.

This extension is not connected in any way with okta or auth0, but solves an
annoying problem.

## Configure this extension

1. Get your organization's connection domain.
2. Go to extension's preferences and set it.

You are done. Now when you click on a link and need authentication, you'll get
the correct SSO page.

## Get your organization's connection domain

Option 1: Ask your IT people.

Option 2: Use curl. Run the following command, the text after connection is your
domain.

```sh
curl -v -L <your-login-url> 2>&1 | grep connection=
```
