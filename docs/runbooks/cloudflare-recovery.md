# Cloudflare Pages Deployment Recovery Runbook

## Overview

This runbook documents the procedure for identifying deployment failures, rolling back to the last known-good deployment, and verifying the restored site.

## Prerequisites

- Cloudflare API Token with Pages permissions
- `wrangler` CLI or `npx` available
- `curl` for verification
- Access to the GitHub repository

## Deployment States

| State | Description |
|-------|-------------|
| `build` | Site staged successfully; deploy not attempted |
| `attempted` | Deploy command ran; live state not verified |
| `verified` | Deployed and the pages.dev URL answered successfully |
| `unavailable` | Required prerequisite absent (no credentials, no deploy tool) |

## Incident Detection

A deployment failure is detected when:
1. `scripts/deploy-site.sh` exits with code 1 (FAIL) or 3 (BLOCKED)
2. GitHub Actions `phase8.yml` deploy job fails
3. Live site verification fails (wrong content, unreachable, forbidden markers)
4. Manual check of `https://company-os-3ox.pages.dev` shows unexpected content

## Recovery Procedure

### Step 1: Identify the Last Known-Good Deployment

```bash
# Check the deploy evidence artifact
cat artifacts/deploy-site-evidence.json

# Check GitHub Actions for the last successful deploy workflow run
gh run list --workflow=phase8-gates --status=success --limit=5

# Get the commit SHA of the last verified deployment
LAST_GOOD_COMMIT=$(gh run view <run-id> --json headSha --jq .headSha)
```

### Step 2: Verify the Candidate Commit

```bash
# Checkout the last known-good commit
git fetch origin
git checkout $LAST_GOOD_COMMIT

# Verify the site files are correct
ls -la business/site/
grep -q 'Software that survives production' business/site/index.html
grep -q 'COM-OS' business/site/index.html
```

### Step 3: Restore Prior Version Using Cloudflare Pages

#### Option A: Wrangler Rollback (if available)

```bash
# List recent deployments
npx wrangler@4 pages deployment list --project-name=company-os --json

# Find the deployment ID for the last good commit
DEPLOYMENT_ID=$(npx wrangler@4 pages deployment list --project-name=company-os --json | \
  python3 -c "
import json, sys, os
commit = os.environ.get('LAST_GOOD_COMMIT', '')
data = json.load(sys.stdin)
for d in data:
    if d.get('Commit Hash', '').startswith(commit[:7]):
        print(d['ID'])
        break
  ")

# Rollback to that deployment
npx wrangler@4 pages deployment rollback $DEPLOYMENT_ID --project-name=company-os
```

#### Option B: Re-deploy from Last Good Commit (Recommended)

```bash
# Ensure credentials are available
export CLOUDFLARE_API_TOKEN=<token>
export CLOUDFLARE_ACCOUNT_ID=<account-id>
export POSTHOG_KEY=<key>
export POSTHOG_HOST=<host>

# Deploy from the last good commit
./scripts/deploy-site.sh
```

### Step 4: Verify the Restored Site

```bash
# Wait for deployment to propagate (Cloudflare Pages typically < 2 minutes)
sleep 120

# Run verification checks
LIVE_DOMAIN="company-os-3ox.pages.dev"
curl -fsS --retry 3 --retry-delay 2 --max-time 30 "https://${LIVE_DOMAIN}/" -o /tmp/live.html

# Verify content
if grep -q '<title>Company OS' /tmp/live.html && \
   grep -q 'Software that survives production' /tmp/live.html && \
   grep -q 'src="analytics.js"' /tmp/live.html && \
   grep -q 'None published yet' /tmp/live.html && \
   ! grep -qE 'mailto:|Case study 0|Replace this placeholder|Lorem ipsum' /tmp/live.html; then
    echo "VERIFICATION PASSED"
else
    echo "VERIFICATION FAILED"
    exit 1
fi
```

### Step 5: Record Incident Evidence

```bash
# Create incident record
cat > evidence/runs/deployment-rollback-$(date -u '+%Y-%m-%d').md <<EOF
# Deployment Rollback Incident

## Date
$(date -u '+%Y-%m-%dT%H:%M:%SZ')

## Trigger
- Failed deployment commit: $(git rev-parse HEAD)
- Failed deployment evidence: artifacts/deploy-site-evidence.json

## Recovery
- Last good commit: $LAST_GOOD_COMMIT
- Rollback method: Re-deploy from last good commit
- Restored commit verified: yes/no

## Verification
- Live site URL: https://company-os-3ox.pages.dev
- Content verified: yes/no
- Analytics config verified: yes/no

## Root Cause
[Document the root cause of the failed deployment]

## Prevention
[Document preventive measures]
EOF
```

## Rollback Verification Checklist

- [ ] Last good commit identified
- [ ] Site files at last good commit verified
- [ ] Cloudflare credentials available
- [ ] Deploy from last good commit succeeds
- [ ] Live URL resolves and answers
- [ ] Title matches "Company OS"
- [ ] Hero content "Software that survives production" present
- [ ] Analytics script served
- [ ] Honest case studies section present
- [ ] No forbidden markers (mailto, placeholder text)
- [ ] PostHog config.js carries key and host
- [ ] Incident evidence recorded

## Escalation

If rollback fails:
1. Check Cloudflare Pages dashboard for deployment errors
2. Verify Cloudflare API token permissions
3. Check wrangler version compatibility
4. Contact Cloudflare support if infrastructure issue
5. Consider manual DNS failover if custom domain configured (not applicable for pages.dev-only)

## Testing the Recovery Procedure

The recovery procedure should be tested in an isolated preview environment:

```bash
# Create a test deployment from a known-good commit
git checkout <test-commit>
./scripts/deploy-site.sh --build-only

# Verify the staged site
# (In CI, this is done by the build stage)

# Full test requires credentials - use a preview project if available
# npx wrangler@4 pages deploy --project-name=company-os-preview ...
```

**Note**: Do not intentionally break production to test rollback. Test in preview/staging environments only.

## Evidence Requirements

Every rollback must produce:
1. `artifacts/deploy-site-evidence.json` with state=`verified`
2. Incident markdown in `evidence/runs/deployment-rollback-<date>.md`
3. Updated `evidence/runs/phase8-final-closure-<date>.md` referencing the incident
4. Git commit of the rollback (if code changes were needed)

## Related Documentation

- `scripts/deploy-site.sh` - Deployment script with verification
- `.github/workflows/phase8.yml` - CI/CD pipeline
- `docs/design/PERFORMANCE_BUDGET.yaml` - Performance budgets
- `evidence/runs/design-phase8-gate-2026-10-11.md` - Phase 8 gate evidence