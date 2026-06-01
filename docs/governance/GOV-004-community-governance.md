# GOV-004 — Community Governance

---

## Metadata

| Field       | Value                |
| ----------- | -------------------- |
| Document ID | GOV-004              |
| Version     | 1.0.0                |
| Status      | DRAFT                |
| Owner       | ArchLens Core Team   |
| Created     | 2026-06-02           |
| Phase       | Phase 5 — Governance |
| Depends On  | GOV-001              |

---

## Purpose

Defines the governance model for the ArchLens community — decision-making structure, roles, and processes for community participation.

---

## Governance Model

ArchLens uses a **Benevolent Dictator** model during early development, transitioning to a **Core Team Consensus** model once the project matures.

### Current Phase: Benevolent Dictator

- Project founder has final decision authority.
- Core team members have commit access and review authority.
- Community contributors participate through issues and PRs.
- Decisions are documented in Decision Logs across architecture documents.

### Future Phase: Core Team Consensus

Triggered when:

- 3+ active core team members.
- 1.0 release of at least the CLI package.
- Active community with regular external contributions.

At that point:

- Decisions require consensus among core team members.
- Tie-breaking authority remains with the founder.
- RFCs require approval from 2+ core team members.

---

## Roles

### Contributor

- Anyone who submits an issue, PR, or participates in discussions.
- No special permissions.

### Committer

- Trusted contributors with merge access.
- Earned by sustained quality contributions (3+ merged PRs).
- Can approve PRs from contributors.
- Cannot merge their own PRs without another committer's approval.

### Core Team

- Committers with architectural decision-making authority.
- Can approve/reject RFCs.
- Can approve breaking changes.
- Invited by existing core team consensus.

### Founder

- Final decision authority during Benevolent Dictator phase.
- Tie-breaking authority during Core Team Consensus phase.

---

## Decision-Making Process

### Standard Decisions (no RFC)

1. Contributor opens PR.
2. Committer or core team member reviews.
3. If approved and CI passes, merge.

### Significant Decisions (RFC required)

1. Contributor opens RFC PR.
2. Discussion period: minimum 5 days for community input.
3. Core team reviews and provides feedback.
4. Revisions incorporated.
5. Core team approves (or founder decides in case of disagreement).
6. RFC merged, implementation begins.

### Reversing Decisions

Decisions can be reversed by:

1. Opening a new RFC that supersedes the original.
2. Documenting why the original decision was wrong.
3. Following the standard RFC approval process.

---

## Communication Channels

| Channel            | Purpose                             |
| ------------------ | ----------------------------------- |
| GitHub Issues      | Bug reports, feature requests       |
| GitHub Discussions | Design discussions, questions, RFCs |
| GitHub PRs         | Code review, contribution           |

No external communication platforms (Slack, Discord) in early phase to keep all context in the repository.

---

## Code of Conduct

ArchLens follows standard open-source conduct expectations:

1. Be respectful and constructive.
2. Focus on technical merit.
3. Assume good intent.
4. Disagree with evidence and reasoning, not personal attacks.
5. Welcome newcomers.

---

## Decision Log

| ID     | Decision                                       | Rationale                                                    |
| ------ | ---------------------------------------------- | ------------------------------------------------------------ |
| DL-099 | Benevolent Dictator initially, Core Team later | Fast decision-making early; distributed authority at scale   |
| DL-100 | All communication on GitHub                    | Single source of truth; no context lost in external channels |
| DL-101 | 5-day minimum RFC discussion period            | Allows async participation across time zones                 |
| DL-102 | 3+ merged PRs for committer status             | Quality bar for trust, not just quantity                     |

---

_End of GOV-004_
