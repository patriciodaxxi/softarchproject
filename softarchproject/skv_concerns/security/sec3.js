npm Security Policy

Outlined in this document are the practices and policies that npm applies to help ensure that we release stable/secure software, and react appropriately to security threats when they arise.
Table of Contents

    Reporting Security Problems to npm
    Security Point of Contact
    Onboarding Developers
    Separation of Duties and Authorization
    Critical Updates And Security Notices
    Responding to Security Threats
    Vulnerability Scanning
    Password Policies
    Application Design Best Practices
    Development Process
    AntiVirus Software

Reporting Security Problems to npm

If you need to report a security vulnerability. Please contact us or email security@npmjs.com.

We review all security reports within one business day. Note that the npm staff is generally offline for most US holidays, but please do not delay your report! Our off-hours support staff can fix many issues, and will alert our security point of contact if needed.
Security Point of Contact

npm's CTO Laurie Voss is the current point of contact for all security related issues.

Any emails sent to security@npmjs.com will be escalated to the security point of contact, who will delegate incident response activities as appropriate.
Onboarding Developers

All new technical hires are introduced to our security policy as part of the onboarding process.
Separation of Duties and Authorization

    Developers are only be given access to key npm services (Fastly, AWS, etc) when it's required for their job.
    IAM is used to limit the permissions on AWS accounts, minimizing the damage that would be incurred if an account is compromised.

Critical Updates And Security Notices

We learn about critical software updates and security threats from a variety of sources:

    Ubuntu's security notices page: http://www.ubuntu.com/usn/trusty/
    The Node.js mailing list.
    The security@npmjs.com email address.
    and other media sources.

Ubuntu Automatic Security Updates

Along with keeping an eye out for critical security updates, automatic security updates are enabled on all of our production servers allowing patches to be applied immediately without human intervention.

https://help.ubuntu.com/community/AutomaticSecurityUpdates
Responding to Security Threats and Critical Updates

When a security threat is identified, we have the following process in place:

    We have the slack channel security-all, which is used to prioritize and coordinate responses to security threats.
    Our Security Point of Contact oversees this discussion: managing the triage, responding to emails, and updating npm's status page.
    Based on the triage, work is allocated to developers to address the threat:

    P0: Drop everything and fix!
    P1: High severity, schedule work within 7 days.
    P2: Medium severity, schedule work within 30 days.
    P3: Low severity, fix within 180 days.

Vulnerability Scanning

Along with reacting to security notifications as they happen, we proactively pen-test and audit software.
Third-Party Audits

We perform regular penetration testing and code audits with the security firm Lift Security.

While working on features at npm, all engineers coordinate security audits with the Security Point of Contact.

Documents from this process are available, and can be provided to customers when requested.
Automated Scanning

The cloud hosting platforms that we use provide options for automated vulnerability scanning.

    AWS: https://aws.amazon.com/security/penetration-testing/
    SoftLayer: https://knowledgelayer.softlayer.com/procedure/nessus-security-scanner

Password Policies

    Enable 2FA on all npm related accounts.
    Passwords should be rolled every 90 days.
    Passwords should contain alpha-numeric characters and symbols.
    Passwords should be a minimum of 8 characters.
    Any systems we build that accept a username and password should reject a user after repeated failed login attempts.

Don't Use Passwords

We should opt for alternative authentication methods when possible:

    Asymmetric keys for connecting to servers.
    Delegated authentication (SAML, OAuth2, etc).
    Opaque access tokens.

SSH Keys

SSH keys should be rolled out selectively, providing developers access to only the severs that they require access to.
Application Design Best Practices

In the next section of the document, we discuss the design methodologies that we use to build stable and secure software.
Logging Practices

Logs are important for both debugging applications and detecting security breaches in our software -- ask CJ for a speech about logging.
What We Log

    We should track failed login attempts to servers:
        Ubuntu provides this information in /var/log/auth.log
    We should log the operations performed by users:
    Ubuntu provides this information in history.
    Applications should provide detailed operational logs in a standardized format.

Log format

All applications should contain logging for date, time, operation, and a unique request identifier.

We use common-log-string internally to standardize this:
Backing Up Logs

At least 90 days of logs should be kept for each service. On high traffic hosts this may require backing-up logs in cloud storage on a regular basis.
Reviewing Logs

On the servers that we manage for other companies, we should audit logs on a regular basis.

TODO: We plan to build automated anomaly detection systems in place for our logs see internal issue #381.
Secrets in Logs

Logs should not contain any sensitive user information, e.g., passwords.

The module hide-secrets is used to help with this.
Limiting Access to Operating System Files

Micro-services should only have access to databases and files that they need access to.

With our docker-based infrastructure (npm Enterprise) this is achieved by having containers only mount folders on the root host that they require access to.

In our production environment, this is achieved by partitioning services across multiple hosts.
Security Groups

Security-groups, or Zones in the case of SoftLayer, are used to limit the network connectivity between hosts.

When deploying a service, ask: "what other services does this actually need to connect to?"
Storage of Data

Any sensitive user information should be encrypted at rest. Using encrypted EBS drives, or an equivalent, is a great way to achieve this.
Inter-Service Communication

Communication between services on the same host can be performed via HTTP.

All inter-service communication between two hosts is performed using TLS.
Development Process

npm has a well-defined, security-focused, development process:
Code Reviews

No code goes into production unless it is reviewed by at least one other developer.

The onus is on the reviewer to ask hard questions: "what are the ramifications of opening up port-X?", "why is this connection being made over HTTP instead of HTTPS?"
Deploying Updates

    Any new code pushed to production is first thoroughly tested in a staging environment.
    Mechanisms are in place for rolling back any changes that are pushed to production.
        If a schema-change is involved, an inverse migration is first tested in staging (we want to be confident that we should role things back).

Unit Testing

We love testing at npm:

    During the code-review process, if you see logic that's complicated and lacks a test, politely ask the developer for a test.
    It's particularly important that tests are added to logic that interacts with sensitive parts of the system: ACL logic, password validation, database access.
    Tests should not contain user-data, make sure to anonymize email addresses, usernames, etc.
    Test coverage is a great way to make sure all of the nooks and crannies of your codebase are tested. npm maintains two tools for test coverage internally tap, and nyc.
    Any new functionality should always come with a test to verify that it does what we think it does.
    Any bug fix should always come with a test so that we don't have to encounter the same bug multiple times.

Design Cycle

The design process, and management techniques vary from team to team at npm. Across the board, however, we strive to have continuous deployments. Releasing many small features as they become production ready.

Security is taken into account during all phases of the software development life-cycle: unit tests think about potential threats; when testing on staging, we attempt to test potential exploits, etc.
AntiVirus Software

On our managed Ubuntu hosts, we run the ClamAV AntiVirus software.
When A Virus Is Identified

The infected server should be retired, and a new server should be provisioned from scratch.
Changes

This is a living document and may be updated from time to time. Please refer to the git history for this document to view the changes.
License

This document may be reused under a Creative Commons Attribution-ShareAlike License.