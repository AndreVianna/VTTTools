# Page snapshot

```yaml
- generic [ref=e4]:
  - alert [ref=e5]:
    - img [ref=e7]
    - generic [ref=e9]:
      - generic [ref=e10]: System Error Occurred
      - text: Something unexpected happened in VTT Tools. Don't worry - your data is safe.
  - heading "Oops! Something went wrong" [level=4] [ref=e11]
  - paragraph [ref=e12]: We're sorry for the inconvenience. The VTT Tools application encountered an unexpected error. Our team has been notified and will investigate the issue.
  - alert [ref=e13]:
    - img [ref=e15]
    - generic [ref=e17]:
      - generic [ref=e18]: Development Info
      - generic [ref=e19]: "Objects are not valid as a React child (found: object with keys {status, data}). If you meant to render a collection of children, use an array instead."
  - generic [ref=e20]:
    - button "Try Again (3 attempts left)" [ref=e21] [cursor=pointer]:
      - img [ref=e23] [cursor=pointer]
      - text: Try Again (3 attempts left)
    - button "Go to Home" [ref=e25] [cursor=pointer]:
      - img [ref=e27] [cursor=pointer]
      - text: Go to Home
    - button "Report Issue" [ref=e29] [cursor=pointer]:
      - img [ref=e31] [cursor=pointer]
      - text: Report Issue
  - generic [ref=e33]: "Error ID: system_1757855348234"
```