# Mani Industries — Ownership Transfer Guide

This document explains how to transfer complete ownership of the Mani Industries platform to a new person or email.

---

## What "Ownership" Means

Full ownership includes:
1. **Firebase Project** — database, auth, storage, hosting, functions
2. **GitHub Repository** — source code
3. **Domain** (if applicable)
4. **Razorpay Account** — payment gateway
5. **Admin role** — ability to manage courses and users

---

## Step 1: Add New Owner to Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select the `mani-industries-c3918` project
3. Click the **gear icon** → **Project Settings**
4. Go to the **Users and permissions** tab
5. Click **Add member**
6. Enter the new owner's Google email address
7. Set role to **Owner**
8. Click **Add**

The new owner will receive an email invitation. They must accept it with their Google account.

---

## Step 2: Grant Admin Role in the App

After the new owner has a Firebase account, run this in the browser console:
```js
const fn = firebase.functions().httpsCallable('setAdmin');
fn({ email: 'newowner@gmail.com' }).then(r => console.log(r));
```

Or the current owner can update Firestore directly:
1. Firestore → users → find the new owner's UID → Edit document
2. Set `roles.owner = true` and `roles.admin = true`

---

## Step 3: Transfer GitHub Repository

### Option A: Transfer the repo
1. Go to GitHub → your repo → **Settings** → scroll to bottom → **Transfer**
2. Enter the new owner's GitHub username
3. Confirm the transfer

### Option B: Add as collaborator
1. GitHub → repo → **Settings** → **Collaborators**
2. Add the new owner's GitHub username with **Admin** access

---

## Step 4: Transfer Razorpay Account

Razorpay accounts are tied to business/individual KYC and cannot be transferred. Options:

**Option A (Recommended):** The new owner creates their own Razorpay account and completes KYC. Then:
1. Update `RAZORPAY_KEY_ID` in `payments.js` with the new key
2. Update Firebase Functions config:
   ```bash
   firebase functions:config:set razorpay.key_id="NEW_KEY" razorpay.key_secret="NEW_SECRET"
   firebase deploy --only functions
   ```

**Option B:** Add the new owner as a team member in the existing Razorpay dashboard (Settings → Team Members).

---

## Step 5: Remove Previous Owner (Optional)

After confirming the new owner has full access:
1. Firebase Console → Project Settings → Users and permissions
2. Find the old owner → Click the 3-dot menu → **Remove member**
3. In Firestore, update the old owner's user document: set `roles.owner = false`
4. Remove old admin custom claim:
   ```js
   // From admin SDK / Cloud Function
   admin.auth().setCustomUserClaims(oldOwnerUid, { admin: false, owner: false });
   ```

---

## Step 6: Update Domain (If Applicable)

If the site uses a custom domain (e.g., maniindustries.com):
1. Log in to your domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS settings
3. The new owner will need access to the registrar account or you transfer the domain

For Firebase Hosting custom domains:
1. Firebase Console → Hosting → Custom domains
2. The new owner manages this from their Firebase project access

---

## Ownership Transfer Checklist

- [ ] New owner added to Firebase project as Owner
- [ ] New owner has `roles.owner = true` in Firestore
- [ ] New owner has `admin: true` Firebase custom claim
- [ ] GitHub repo transferred or new owner added as Admin collaborator
- [ ] Razorpay keys updated (new account or team member added)
- [ ] Domain registrar access transferred
- [ ] Old owner removed from Firebase project (optional)
- [ ] New owner tested: can sign in, can access admin functions, payments work

---

## Emergency: Resetting the Platform

To wipe and restart all data (IRREVERSIBLE — back up first!):

1. **Export all data:**
   ```bash
   gcloud firestore export gs://mani-industries-c3918-backups/pre-reset-$(date +%Y%m%d)
   ```

2. **Delete all Firestore collections** via Firebase Console or:
   ```bash
   firebase firestore:delete --all-collections
   ```

3. **Reset Firebase Authentication** (delete all users):
   Firebase Console → Authentication → Users → select all → Delete

4. **Clear Storage:**
   Firebase Console → Storage → Delete all files

5. **Re-seed courses:**
   Import `courses_seed.json` back into Firestore

> **Warning:** This deletes all user accounts, progress, purchases, and enrollments permanently. Only do this if you are starting completely fresh.
