---
'@journeyapps-labs/common-sdk': patch
---

Allow specifying a custom `encoder`, similar to the existing `decoder` field, for a fetch client requests. 
Check if the user declared codec contains a decode for the matching type and fall back to the default codec if it doesn't instead of just always using the default codec.
