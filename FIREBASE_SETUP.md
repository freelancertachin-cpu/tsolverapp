# T-Solver Firebase Setup

Project ID: `t-solver-95481`
Public app URL: `https://tsolverapp.vercel.app`

## Firebase services to enable

Enable these from Firebase Console:

- Authentication: Email/Password + Google
- Firestore Database
- Storage
- Hosting
- Cloud Messaging
- Analytics

## Admin setup

The frontend already treats `rabbihossainltd@gmail.com` as an admin email. For Firestore security rules, also create this document after first login:

Collection: `admin_users`
Document ID: your Firebase Auth UID

```json
{
  "email": "rabbihossainltd@gmail.com",
  "role": "admin",
  "created_at": 0
}
```

## Termux build + deploy

Run from Termux home folder, not `/sdcard/Download`, because Android shared storage breaks npm symlinks.

```bash
cd ~
rm -rf t-solver-work
mkdir t-solver-work
cd /sdcard/Download/t-solver/t-solver-main
tar --exclude=node_modules --exclude=.git -cf - . | (cd ~/t-solver-work && tar -xf -)
cd ~/t-solver-work
npm install --legacy-peer-deps
npm run build
```

Deploy to Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase use t-solver-95481
firebase deploy
```

Deploy only rules:

```bash
firebase deploy --only firestore:rules,storage
```

## GitHub push

```bash
cd ~/t-solver-work
rm -rf .git
git init
git branch -M main
git add .
git commit -m "Convert T-Solver to Firebase"
git remote add origin https://github.com/tsolverai/t-solver.git
git push -u origin main --force
```

## Notes

- Supabase has been replaced by a Firebase compatibility layer so existing app logic can keep working without rewriting every component.
- Firestore collections used: `profiles`, `payments`, `premium_users`, `affiliate_codes`, `affiliate_earnings`, `withdraw_requests`, `doubts`, `doubt_replies`, `notifications`, `user_memory`, `study_sessions`, `quiz_attempts`, `smart_notes`, `game_sessions`, `reminders`, `feedback`.
- Heavy OCR/plot/TF libraries are aliased to lightweight production-safe shims to keep mobile bundle build stable. Replace these shims with Firebase Functions / server OCR if you need full OCR at scale.


## Current Production Firebase Setup

- Final app URL: https://t-solver-95481.web.app
- Admin email: freelancertachin@gmail.com
- Admin UID: b6pl0LVKmoWGpfXIkITupYN2tnB3
- Firestore: enabled
- Storage: enabled

Deploy hosting + rules:

```bash
firebase deploy --only hosting,firestore,storage --project t-solver-95481
```

If you only want to update the website files:

```bash
firebase deploy --only hosting --project t-solver-95481
```
