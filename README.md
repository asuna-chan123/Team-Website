# Team Website Project

Welcome to the Team Website project!

This guide explains the team workflow with Git and GitHub so the code stays conflict-free and stable.

## 🌳 Branching Model

The project follows this branching model:

1. **`main` (or `master`) branch**:
   - This branch contains the cleanest and most complete code.
   - Code here should always be ready to run or deploy.
   - ⚠️ **Rule**: Do not push code directly to `main`.

2. **`dev` (or `develop`) branch**:
   - This branch is created from `main`.
   - It is the integration branch where everyone merges their work.
   - When a feature is ready, merge it into `dev` to test together and resolve conflicts.

3. **Feature branches**:
   - Create a separate branch from `dev` for each task.
   - 📌 **Naming rule**: use `feature/<feature-name>` or `<name>/<feature-name>`.
     - Example: `feature/login-page`, `an/header-component`, `binh/footer`.

---

## 🚀 Daily Workflow

Follow these steps whenever you start a new feature:

### Step 1: Get the latest code
Make sure you are on `dev` and have the latest changes before creating a branch.
```bash
git checkout dev
git pull origin dev
```

### Step 2: Create your working branch
Create a new feature branch from `dev`:
```bash
git checkout -b feature/your-feature-name
```

### Step 3: Code and commit
Make your changes and commit them when a piece is done:
```bash
git add .
git commit -m "Short description of what you changed"
```

### Step 4: Push your branch to GitHub
Push your branch after finishing your work:
```bash
git push origin feature/your-feature-name
```

### Step 5: Create a Pull Request (PR)
1. Go to the project on GitHub: https://github.com/asuna-chan123/Team-Website
2. Click **Compare & pull request** on your pushed branch.
3. **Important**: set the base branch to `dev`, not `main`.
4. Add a title and description for your PR.
5. Click **Create pull request**.

### Step 6: Review and merge
- Team members or the project lead will review the PR.
- If everything is stable and there are no conflicts, merge the branch into `dev`.

---

Good luck and happy coding! 🚀
