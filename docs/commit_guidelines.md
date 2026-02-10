# Git Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/) specification to standardize commit message format.

## 📋 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Required

- **type**: Commit type (required)
- **subject**: Brief description (required)

### Optional

- **scope**: Affected area (optional)
- **body**: Detailed description (optional)
- **footer**: Related issues or breaking changes (optional)

## 🏷️ Type Description

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add video playback controls` |
| `fix` | Bug fix | `fix: resolve memory leak in recorder` |
| `docs` | Documentation changes | `docs: update installation guide` |
| `style` | Code style changes (no functional impact) | `style: format code with prettier` |
| `refactor` | Code refactoring (no bug fix or feature) | `refactor: simplify task state logic` |
| `perf` | Performance improvements | `perf: optimize video encoding speed` |
| `test` | Test related changes | `test: add unit tests for actions` |
| `build` | Build system or dependency changes | `build: upgrade vite to 6.3.5` |
| `ci` | CI/CD configuration changes | `ci: add github actions workflow` |
| `chore` | Other maintenance tasks | `chore: update dependencies` |
| `revert` | Revert previous commit | `revert: revert feat: add feature X` |

## 🔧 Automatic Validation

This project uses commitlint to automatically validate commit message format. Invalid commits will be rejected:

```bash
$ git commit -m "bad message"
⧗   input: bad message
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
```

Valid commits will pass through:

```bash
$ git commit -m "feat: add new feature"
[main abc1234] feat: add new feature
 1 file changed, 10 insertions(+)
```

## 📚 References

- [Conventional Commits Official Documentation](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
- [commitlint Documentation](https://commitlint.js.org/)
