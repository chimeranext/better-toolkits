{
  "name": "main-__OWNER__-only",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": {
    "ref_name": { "exclude": [], "include": ["refs/heads/main"] }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "required_reviewers": [],
        "require_code_owner_review": false,
        "dismissal_restriction": { "enabled": false, "allowed_actors": [] },
        "require_last_push_approval": true,
        "required_review_thread_resolution": true,
        "require_extra_approval_for_unattributed_changes": true,
        "allowed_merge_methods": ["merge"]
      }
    },
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    {
      "type": "required_status_checks",
      "parameters": {
        "required_status_checks": [
          { "context": "__CHECK_CONTEXT__" }
        ],
        "strict_required_status_checks_policy": true
      }
    }
  ]
}
